import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { z } from "zod";
import { collectLuauFiles } from "./lintLuau.js";
import type { ToolDefinition } from "./types.js";

const execFileAsync = promisify(execFile);

const inputSchema = {
	paths: z
		.array(z.string())
		.min(1)
		.describe("Files or directories to format. Directories are scanned recursively for .luau and .lua files."),
};

export const formatLuau: ToolDefinition<typeof inputSchema> = {
	name: "format_luau",
	title: "Format Luau code",
	description:
		"Format Luau/Lua files in place with StyLua. Requires StyLua to be installed; returns installation guidance otherwise.",
	inputSchema,
	handler: async (args) => {
		const files = collectLuauFiles(args["paths"] as string[]);
		if (files.length === 0) {
			return "No .luau or .lua files found in the given paths.";
		}
		try {
			const probe = process.platform === "win32" ? "where" : "command";
			const probeArgs = process.platform === "win32" ? ["stylua"] : ["-v", "stylua"];
			await execFileAsync(probe, probeArgs);
		} catch {
			return [
				"StyLua is not installed, so formatting was skipped.",
				"",
				"Install StyLua: https://github.com/JohnnyMorganz/StyLua",
				"  `cargo install stylua` or download a release binary, then call format_luau again.",
			].join("\n");
		}
		try {
			await execFileAsync("stylua", files);
			return `StyLua formatted ${files.length} file(s) in place.`;
		} catch (err) {
			const e = err as { stderr?: string; message?: string };
			return `StyLua failed: ${(e.stderr ?? e.message ?? "unknown error").trim()}`;
		}
	},
};
