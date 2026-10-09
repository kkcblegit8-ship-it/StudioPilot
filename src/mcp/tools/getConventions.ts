import { z } from "zod";
import type { ToolDefinition } from "./types.js";

const inputSchema = {
	topic: z
		.enum(["networking", "data-model", "ui", "performance", "all"])
		.optional()
		.describe("Which conventions reference to return. Defaults to all."),
};

const NETWORKING = `## Client/server networking conventions

- The server is authoritative. Never trust the client: validate every RemoteEvent/RemoteFunction argument on the server (types, ranges, cooldowns, ownership).
- Put RemoteEvents and RemoteFunctions in ReplicatedStorage, created once (by Rojo tree or a bootstrap script), never created per-request.
- Prefer RemoteEvents (fire-and-forget) over RemoteFunctions. RemoteFunctions yield and can be exploited to hang server threads; if you must use one, wrap the server handler in pcall and add timeouts.
- Rate-limit remotes per player. A simple token-bucket table keyed by player UserId stops remote spam.
- Do not replicate large or rapidly changing state through remotes every frame. Replicate snapshots at 5-10 Hz and interpolate on the client.
- Never send Instances the client should not see, and never pass the player object when UserId suffices.
- Use UnreliableRemoteEvent for high-frequency, loss-tolerant data (positions, effects).
`;

const DATA_MODEL = `## Data model conventions

- Always fetch services with game:GetService("Name"). Never index them as game.Name; the service may not exist yet.
- Core services and their roles:
  - ServerScriptService: server Scripts. ServerStorage: server-only assets/modules.
  - ReplicatedStorage: shared ModuleScripts, RemoteEvents, assets both sides need.
  - StarterPlayer > StarterPlayerScripts: player LocalScripts. StarterGui: ScreenGuis.
  - Workspace: replicated 3D world. Never store secrets in Workspace; clients can read everything replicated to them.
- Scripts run on the server; LocalScripts run on clients. ModuleScripts run wherever they are required from.
- Use attributes or well-known ModuleScript configs instead of deep WaitForChild chains where possible. When you must wait, always pass a timeout: instance:WaitForChild("Name", 5).
- Organize code as ModuleScripts with a single responsibility; require them from thin Script/LocalScript entry points.
`;

const UI = `## UI conventions

- Build UI under StarterGui as ScreenGui instances. Set ResetOnSpawn=false for persistent HUDs.
- Use scale (UDim2.fromScale) for layout and offset only for fixed-size details, so UI adapts to all screen sizes.
- Prefer UIListLayout/UIPadding/UICorner over manual pixel math. Anchor dialogs with AnchorPoint 0.5, 0.5 and Position UDim2.fromScale(0.5, 0.5).
- Animate with TweenService, never with manual per-frame Position updates. Cancel tweens when the UI is destroyed.
- Keep per-frame UI updates minimal; update text only when the value changes.
- Respect the client/server boundary: UI input is untrusted, confirm purchases and actions on the server.
`;

const PERFORMANCE = `## Performance conventions

- Avoid per-frame allocations in hot loops. Reuse tables and Vector3 values where practical.
- Use task.spawn/task.defer instead of spawn(); never use wait(), use task.wait().
- Disconnect event connections when objects are destroyed (use :Destroy() which cleans up, or track connections explicitly).
- Prefer CollectionService tags over scanning the whole Workspace for gameplay objects.
- Debounce expensive operations (pathfinding, raycasts over many parts). Cache raycast params.
- On the client, keep the number of active tweens and connections bounded; profile with the microprofiler before optimizing blindly.
`;

const TOPICS: Record<string, string> = {
	networking: NETWORKING,
	"data-model": DATA_MODEL,
	ui: UI,
	performance: PERFORMANCE,
};

export const getConventions: ToolDefinition<typeof inputSchema> = {
	name: "get_conventions",
	title: "Get Roblox conventions",
	description:
		"Return StudioPilot's curated Roblox conventions reference: networking, data-model, ui, performance, or all. Use it to ground generated code in correct Roblox patterns.",
	inputSchema,
	handler: async (args) => {
		const topic = (args["topic"] as string | undefined) ?? "all";
		if (topic === "all") {
			return ["# StudioPilot Roblox conventions reference", NETWORKING, DATA_MODEL, UI, PERFORMANCE].join("\n");
		}
		return `# StudioPilot Roblox conventions reference\n\n${TOPICS[topic]}`;
	},
};
