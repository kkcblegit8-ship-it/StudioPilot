import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { z } from "zod";
import {
	GITIGNORE,
	agentsMd,
	projectReadme,
	rojoProjectJson,
	scriptBoilerplate,
} from "../../shared/templates.js";
import type { ToolDefinition } from "./types.js";

const inputSchema = {
	name: z.string().min(1).describe("Project name, used for the folder and project.json"),
	path: z
		.string()
		.optional()
		.describe("Directory to create the project in. Defaults to the current working directory."),
};

export const scaffoldProject: ToolDefinition<typeof inputSchema> = {
	name: "scaffold_project",
	title: "Scaffold Roblox project",
	description:
		"Create a new Rojo-structured Roblox game project: project.json, src/server, src/client, src/shared, starter scripts, README, AGENTS.md, and .gitignore.",
	inputSchema,
	handler: async (args) => {
		const name = args["name"] as string;
		const base = resolve((args["path"] as string | undefined) ?? process.cwd());
		const root = join(base, name);

		if (existsSync(root)) {
			return `Project directory already exists: ${root}. Choose a different name or path.`;
		}

		const created: string[] = [];
		const write = (rel: string, content: string) => {
			const full = join(root, rel);
			mkdirSync(join(full, ".."), { recursive: true });
			writeFileSync(full, content);
			created.push(rel);
		};

		write("project.json", rojoProjectJson(name));
		write("src/server/Main.server.luau", scriptBoilerplate("Script", "Main"));
		write("src/client/Main.client.luau", scriptBoilerplate("LocalScript", "Main"));
		write("src/shared/Config.luau", scriptBoilerplate("ModuleScript", "Config"));
		write("README.md", projectReadme(name));
		write("AGENTS.md", agentsMd(name));
		write(".gitignore", GITIGNORE);

		return [
			`Scaffolded Roblox project "${name}" at ${root}`,
			"",
			"Created files:",
			...created.map((f) => `- ${f}`),
			"",
			"Next steps:",
			"1. Run `rojo serve` in the project directory.",
			"2. Connect from Roblox Studio using the Rojo plugin.",
			"3. Install the StudioPilot skills so your agent follows Roblox conventions.",
		].join("\n");
	},
};
