import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { z } from "zod";
import { scriptBoilerplate, type ScriptKind } from "../../shared/templates.js";
import type { ToolDefinition } from "./types.js";

const kinds = ["Script", "LocalScript", "ModuleScript"] as const;

const inputSchema = {
	kind: z.enum(kinds).describe("Roblox script class"),
	name: z.string().min(1).describe("Script name without extension, e.g. CoinCollector"),
	path: z.string().describe("Directory to create the script in, e.g. src/server"),
};

export const createScript: ToolDefinition<typeof inputSchema> = {
	name: "create_script",
	title: "Create Luau script",
	description:
		"Generate a Roblox Script, LocalScript, or ModuleScript with --!strict header, doc comment, and idiomatic boilerplate for its kind.",
	inputSchema,
	handler: async (args) => {
		const kind = args["kind"] as ScriptKind;
		const name = args["name"] as string;
		const dir = resolve(args["path"] as string);
		const ext = kind === "ModuleScript" ? ".luau" : kind === "Script" ? ".server.luau" : ".client.luau";
		const full = join(dir, `${name}${ext}`);

		if (existsSync(full)) {
			return `File already exists: ${full}. Choose a different name.`;
		}

		mkdirSync(dir, { recursive: true });
		writeFileSync(full, scriptBoilerplate(kind, name));

		const placement =
			kind === "LocalScript"
				? "Place it under StarterPlayerScripts (src/client) or StarterGui, never in server containers."
				: kind === "Script"
					? "Place it under ServerScriptService (src/server), never in client containers."
					: "Place it in ReplicatedStorage (src/shared) if both sides need it.";
		return [`Created ${kind} at ${full}`, "", placement].join("\n");
	},
};
