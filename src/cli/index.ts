#!/usr/bin/env node
/**
 * StudioPilot CLI entry point.
 * Usage: studiopilot init <project-name> [--path <dir>] [--no-skills] [--no-mcp-config]
 */
import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
	GITIGNORE,
	MCP_CONFIG_JSON,
	agentsMd,
	projectReadme,
	rojoProjectJson,
	scriptBoilerplate,
} from "../shared/templates.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
// dist/cli/index.js -> package root is ../../.. ; skills live at package root.
const PKG_ROOT = resolve(__dirname, "..", "..");

function usage(): string {
	return [
		"StudioPilot CLI - scaffold AI-ready Roblox projects",
		"",
		"Usage:",
		"  studiopilot init <project-name> [options]",
		"",
		"Options:",
		"  --path <dir>     Parent directory for the new project (default: cwd)",
		"  --no-skills      Skip installing Claude Code skills into .claude/skills",
		"  --no-mcp-config  Skip writing .mcp.json",
		"  --help           Show this help",
	].join("\n");
}

function init(rawArgs: string[]): void {
	const args = [...rawArgs];
	const flags = new Set(args.filter((a) => a.startsWith("--")));
	const positionals = args.filter((a) => !a.startsWith("--"));
	const name = positionals[1]; // positionals[0] === "init"

	if (!name) {
		console.error("Error: missing <project-name>.\n");
		console.error(usage());
		process.exit(1);
	}

	const pathIdx = args.indexOf("--path");
	const base = resolve(pathIdx !== -1 && args[pathIdx + 1] ? args[pathIdx + 1] : process.cwd());
	const root = join(base, name);

	if (existsSync(root)) {
		console.error(`Error: directory already exists: ${root}`);
		process.exit(1);
	}

	const write = (rel: string, content: string) => {
		const full = join(root, rel);
		mkdirSync(join(full, ".."), { recursive: true });
		writeFileSync(full, content);
		console.log(`  created ${rel}`);
	};

	console.log(`Scaffolding "${name}" in ${root}`);
	write("project.json", rojoProjectJson(name));
	write("src/server/Main.server.luau", scriptBoilerplate("Script", "Main"));
	write("src/client/Main.client.luau", scriptBoilerplate("LocalScript", "Main"));
	write("src/shared/Config.luau", scriptBoilerplate("ModuleScript", "Config"));
	write("README.md", projectReadme(name));
	write("AGENTS.md", agentsMd(name));
	write(".gitignore", GITIGNORE);

	if (!flags.has("--no-skills")) {
		const skillsSrc = join(PKG_ROOT, "skills");
		const skillsDest = join(root, ".claude", "skills");
		if (existsSync(skillsSrc)) {
			cpSync(skillsSrc, skillsDest, { recursive: true });
			console.log("  installed Claude Code skills into .claude/skills");
		}
	}

	if (!flags.has("--no-mcp-config")) {
		write(".mcp.json", MCP_CONFIG_JSON);
		console.log("  wrote .mcp.json (Claude Code will offer to load the StudioPilot MCP server)");
	}

	console.log("\nDone. Next steps:");
	console.log(`  cd ${name} && rojo serve`);
	console.log("Then connect from Roblox Studio with the Rojo plugin.");
}

function main(): void {
	const args = process.argv.slice(2);
	const cmd = args[0];
	if (cmd === "init") {
		init(args);
		return;
	}
	if (cmd === "--help" || cmd === "-h" || cmd === "--version" || cmd === "-v") {
		console.log(cmd.includes("version") ? "studiopilot 0.1.0" : usage());
		return;
	}
	console.error(`Unknown command: ${cmd ?? "(none)"}\n`);
	console.error(usage());
	process.exit(1);
}

main();
