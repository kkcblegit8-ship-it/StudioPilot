#!/usr/bin/env node
/**
 * StudioPilot MCP server entry point.
 * Exposes Roblox development tools to AI coding agents over stdio.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { scaffoldProject } from "./tools/scaffoldProject.js";
import { createScript } from "./tools/createScript.js";
import { lintLuau } from "./tools/lintLuau.js";
import { formatLuau } from "./tools/formatLuau.js";
import { validateProject } from "./tools/validateProject.js";
import { getConventions } from "./tools/getConventions.js";
import type { ToolDefinition } from "./tools/types.js";

const TOOLS: ToolDefinition[] = [
	scaffoldProject,
	createScript,
	lintLuau,
	formatLuau,
	validateProject,
	getConventions,
];

const server = new McpServer({ name: "studiopilot", version: "0.1.0" });

for (const tool of TOOLS) {
	server.registerTool(
		tool.name,
		{
			title: tool.title,
			description: tool.description,
			inputSchema: tool.inputSchema,
		},
		async (args) => ({
			content: [{ type: "text" as const, text: await tool.handler(args as Record<string, unknown>) }],
		})
	);
}

async function main(): Promise<void> {
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

main().catch((err) => {
	console.error("StudioPilot MCP server failed to start:", err);
	process.exit(1);
});
