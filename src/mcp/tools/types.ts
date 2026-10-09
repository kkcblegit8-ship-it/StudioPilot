import type { ZodRawShape } from "zod";

/** A StudioPilot tool: metadata plus a handler returning markdown text. */
export interface ToolDefinition<T extends ZodRawShape = ZodRawShape> {
	name: string;
	title: string;
	description: string;
	inputSchema: T;
	handler: (args: Record<string, unknown>) => Promise<string>;
}
