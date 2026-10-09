import { existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { z } from "zod";
import type { ToolDefinition } from "./types.js";

const inputSchema = {
	path: z.string().optional().describe("Project directory to validate. Defaults to the current working directory."),
};

interface Issue {
	level: "error" | "warning";
	message: string;
}

/** Walk a Rojo tree node, resolving $path entries against the project root. */
function checkTree(node: unknown, root: string, trail: string, issues: Issue[]): void {
	if (typeof node !== "object" || node === null) {
		issues.push({ level: "error", message: `tree node at "${trail}" is not an object.` });
		return;
	}
	const rec = node as Record<string, unknown>;
	if (typeof rec["$path"] === "string") {
		const target = resolve(root, rec["$path"] as string);
		if (!existsSync(target)) {
			issues.push({ level: "error", message: `tree "${trail}" maps $path to "${rec["$path"]}", which does not exist.` });
		}
		return;
	}
	for (const [key, child] of Object.entries(rec)) {
		if (key.startsWith("$")) continue;
		checkTree(child, root, trail ? `${trail}.${key}` : key, issues);
	}
}

export const validateProject: ToolDefinition<typeof inputSchema> = {
	name: "validate_project",
	title: "Validate Roblox project",
	description:
		"Validate a Rojo project: project.json parses and has required fields, every $path in the tree exists, and the conventional src/server, src/client, src/shared layout is present.",
	inputSchema,
	handler: async (args) => {
		const root = resolve((args["path"] as string | undefined) ?? process.cwd());
		const issues: Issue[] = [];
		const notes: string[] = [];

		const projectJson = join(root, "project.json");
		if (!existsSync(projectJson)) {
			return `No project.json found in ${root}. Run scaffold_project or studiopilot init to create one.`;
		}

		let parsed: Record<string, unknown>;
		try {
			parsed = JSON.parse(readFileSync(projectJson, "utf8")) as Record<string, unknown>;
		} catch (err) {
			return `project.json is not valid JSON: ${(err as Error).message}`;
		}

		if (typeof parsed["name"] !== "string" || parsed["name"] === "") {
			issues.push({ level: "error", message: 'project.json is missing a non-empty "name" field.' });
		}
		if (typeof parsed["tree"] !== "object" || parsed["tree"] === null) {
			issues.push({ level: "error", message: 'project.json is missing the "tree" object.' });
		} else {
			checkTree(parsed["tree"], root, "", issues);
		}

		for (const dir of ["src/server", "src/client", "src/shared"]) {
			const full = join(root, dir);
			if (!existsSync(full) || !statSync(full).isDirectory()) {
				issues.push({ level: "warning", message: `Conventional directory "${dir}/" is missing.` });
			}
		}
		if (!existsSync(join(root, "AGENTS.md"))) {
			notes.push('Tip: add AGENTS.md (studiopilot init generates one) so AI agents follow project conventions.');
		}

		const errors = issues.filter((i) => i.level === "error");
		const warnings = issues.filter((i) => i.level === "warning");
		const lines = [
			`Validated ${root}: ${errors.length} error(s), ${warnings.length} warning(s).`,
			"",
			...issues.map((i) => `${i.level === "error" ? "ERROR" : "WARN"}: ${i.message}`),
			...notes.map((n) => `NOTE: ${n}`),
		];
		if (issues.length === 0) lines.push("Project structure looks good.");
		return lines.join("\n");
	},
};
