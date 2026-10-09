import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
	agentsMd,
	GITIGNORE,
	MCP_CONFIG_JSON,
	projectReadme,
	rojoProjectJson,
	scriptBoilerplate,
} from "../shared/templates.js";

describe("scriptBoilerplate", () => {
	it("generates a strict-mode Script with server boilerplate", () => {
		const out = scriptBoilerplate("Script", "Main");
		assert.match(out, /^--!strict/);
		assert.match(out, /ServerScriptService|server logic/);
		assert.match(out, /Main \(Script\)/);
	});

	it("generates a LocalScript referencing LocalPlayer", () => {
		const out = scriptBoilerplate("LocalScript", "Hud");
		assert.match(out, /^--!strict/);
		assert.match(out, /LocalPlayer/);
	});

	it("generates a ModuleScript returning a table", () => {
		const out = scriptBoilerplate("ModuleScript", "Config");
		assert.match(out, /^--!strict/);
		assert.match(out, /local Config = \{\}/);
		assert.match(out, /return Config/);
	});
});

describe("rojoProjectJson", () => {
	it("produces valid JSON with name and tree", () => {
		const parsed = JSON.parse(rojoProjectJson("my-game")) as Record<string, unknown>;
		assert.equal(parsed["name"], "my-game");
		assert.ok(typeof parsed["tree"] === "object" && parsed["tree"] !== null);
	});

	it("maps src folders with $path entries", () => {
		const raw = rojoProjectJson("my-game");
		assert.match(raw, /\$path/);
		assert.match(raw, /src\/server/);
		assert.match(raw, /src\/client/);
		assert.match(raw, /src\/shared/);
	});
});

describe("agentsMd", () => {
	it("mentions the project name and key rules", () => {
		const out = agentsMd("my-game");
		assert.match(out, /my-game/);
		assert.match(out, /--!strict/);
		assert.match(out, /GetService/);
		assert.match(out, /client\/server boundary/);
	});
});

describe("projectReadme", () => {
	it("mentions the project name and layout", () => {
		const out = projectReadme("my-game");
		assert.match(out, /# my-game/);
		assert.match(out, /src\/server/);
		assert.match(out, /rojo serve/);
	});
});

describe("constants", () => {
	it("GITIGNORE excludes build artifacts", () => {
		assert.match(GITIGNORE, /\.rbxlx/);
	});

	it("MCP_CONFIG_JSON is valid JSON wiring npx studiopilot-mcp", () => {
		const parsed = JSON.parse(MCP_CONFIG_JSON) as {
			mcpServers: { studiopilot: { command: string; args: string[] } };
		};
		assert.equal(parsed.mcpServers.studiopilot.command, "npx");
		assert.ok(parsed.mcpServers.studiopilot.args.includes("studiopilot-mcp"));
	});
});
