import { execFile } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { z } from "zod";
import type { ToolDefinition } from "./types.js";

const execFileAsync = promisify(execFile);

const inputSchema = {
	paths: z
		.array(z.string())
		.min(1)
		.describe("Files or directories to lint. Directories are scanned recursively for .luau and .lua files."),
};

/** Collect .luau/.lua files from a list of files and directories. */
export function collectLuauFiles(paths: string[]): string[] {
	const out: string[] = [];
	const visit = (p: string) => {
		const full = resolve(p);
		if (!existsSync(full)) return;
		const st = statSync(full);
		if (st.isFile()) {
			if (full.endsWith(".luau") || full.endsWith(".lua")) out.push(full);
			return;
		}
		for (const entry of readdirSync(full)) visit(join(full, entry));
	};
	for (const p of paths) visit(p);
	return out;
}

async function commandExists(cmd: string): Promise<boolean> {
	try {
		const probe = process.platform === "win32" ? "where" : "command";
		const args = process.platform === "win32" ? [cmd] : ["-v", cmd];
		await execFileAsync(probe, args);
		return true;
	} catch {
		return false;
	}
}

export const lintLuau: ToolDefinition<typeof inputSchema> = {
	name: "lint_luau",
	title: "Lint Luau code",
	description:
		"Lint Luau/Lua files with StyLua (--check) and Selene when installed. Reports per-tool results, or installation guidance when neither linter is available.",
	inputSchema,
	handler: async (args) => {
		const files = collectLuauFiles(args["paths"] as string[]);
		if (files.length === 0) {
			return "No .luau or .lua files found in the given paths.";
		}

		const lines = [`Checking ${files.length} file(s):`, ""];
		const hasStylua = await commandExists("stylua");
		const hasSelene = await commandExists("selene");

		if (!hasStylua && !hasSelene) {
			return [
				`Found ${files.length} Luau file(s), but no linter is installed.`,
				"",
				"Install one of the following for real linting:",
				"- StyLua (formatter + style check): https://github.com/JohnnyMorganz/StyLua",
				"  Install: `cargo install stylua` or download a release binary.",
				"- Selene (linter): https://github.com/Kampfkarren/selene",
				"  Install: `cargo install selene` or download a release binary.",
				"",
				"Then call lint_luau again.",
			].join("\n");
		}

		if (hasStylua) {
			try {
				await execFileAsync("stylua", ["--check", ...files]);
				lines.push("StyLua: all files pass --check (formatting clean).");
			} catch (err) {
				const e = err as { stdout?: string; stderr?: string };
				lines.push("StyLua: formatting issues found:", (e.stdout ?? e.stderr ?? "").trim());
			}
			lines.push("");
		}
		if (hasSelene) {
			try {
				await execFileAsync("selene", files);
				lines.push("Selene: no lint errors.");
			} catch (err) {
				const e = err as { stdout?: string; stderr?: string };
				lines.push("Selene: lint issues found:", (e.stdout ?? e.stderr ?? "").trim());
			}
			lines.push("");
		}
		return lines.join("\n").trim();
	},
};
