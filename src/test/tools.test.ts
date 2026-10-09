import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scaffoldProject } from "../mcp/tools/scaffoldProject.js";
import { createScript } from "../mcp/tools/createScript.js";
import { validateProject } from "../mcp/tools/validateProject.js";
import { getConventions } from "../mcp/tools/getConventions.js";

let sandbox: string;

before(() => {
	sandbox = mkdtempSync(join(tmpdir(), "studiopilot-test-"));
});

after(() => {
	rmSync(sandbox, { recursive: true, force: true });
});

describe("scaffoldProject", () => {
	it("creates the full Rojo project layout", async () => {
		const out = await scaffoldProject.handler({ name: "test-game", path: sandbox });
		assert.match(out, /Scaffolded Roblox project "test-game"/);
		for (const f of [
			"project.json",
			"src/server/Main.server.luau",
			"src/client/Main.client.luau",
			"src/shared/Config.luau",
			"README.md",
			"AGENTS.md",
			".gitignore",
		]) {
			assert.ok(existsSync(join(sandbox, "test-game", f)), `missing ${f}`);
		}
	});

	it("refuses to overwrite an existing directory", async () => {
		const out = await scaffoldProject.handler({ name: "test-game", path: sandbox });
		assert.match(out, /already exists/);
	});
});

describe("createScript", () => {
	it("creates a ModuleScript with .luau extension and strict header", async () => {
		const dir = join(sandbox, "scripts");
		const out = await createScript.handler({ kind: "ModuleScript", name: "Util", path: dir });
		assert.match(out, /Created ModuleScript/);
		const content = readFileSync(join(dir, "Util.luau"), "utf8");
		assert.match(content, /^--!strict/);
		assert.match(content, /return Util/);
	});

	it("uses .server.luau for Scripts and .client.luau for LocalScripts", async () => {
		const dir = join(sandbox, "scripts2");
		await createScript.handler({ kind: "Script", name: "S", path: dir });
		await createScript.handler({ kind: "LocalScript", name: "C", path: dir });
		assert.ok(existsSync(join(dir, "S.server.luau")));
		assert.ok(existsSync(join(dir, "C.client.luau")));
	});

	it("refuses to overwrite an existing file", async () => {
		const dir = join(sandbox, "scripts");
		const out = await createScript.handler({ kind: "ModuleScript", name: "Util", path: dir });
		assert.match(out, /already exists/);
	});
});

describe("validateProject", () => {
	it("passes a freshly scaffolded project", async () => {
		const out = await validateProject.handler({ path: join(sandbox, "test-game") });
		assert.match(out, /0 error\(s\), 0 warning\(s\)/);
	});

	it("reports invalid JSON", async () => {
		const dir = join(sandbox, "bad-json");
		const { mkdirSync } = await import("node:fs");
		mkdirSync(dir, { recursive: true });
		writeFileSync(join(dir, "project.json"), "{not json");
		const out = await validateProject.handler({ path: dir });
		assert.match(out, /not valid JSON/);
	});

	it("reports a missing project.json", async () => {
		const out = await validateProject.handler({ path: join(sandbox, "nope") });
		assert.match(out, /No project.json found/);
	});

	it("flags a $path pointing at nothing", async () => {
		const dir = join(sandbox, "bad-tree");
		const { mkdirSync } = await import("node:fs");
		mkdirSync(dir, { recursive: true });
		writeFileSync(
			join(dir, "project.json"),
			JSON.stringify({ name: "x", tree: { $className: "DataModel", Missing: { $path: "nope" } } })
		);
		const out = await validateProject.handler({ path: dir });
		assert.match(out, /ERROR/);
		assert.match(out, /does not exist/);
	});
});

describe("getConventions", () => {
	it("returns all topics by default", async () => {
		const out = await getConventions.handler({});
		assert.match(out, /networking conventions/);
		assert.match(out, /Data model conventions/);
		assert.match(out, /UI conventions/);
		assert.match(out, /Performance conventions/);
	});

	it("returns a single topic on request", async () => {
		const out = await getConventions.handler({ topic: "networking" });
		assert.match(out, /server is authoritative/);
		assert.doesNotMatch(out, /UI conventions/);
	});
});
