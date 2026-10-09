---
name: roblox-data-model
description: Navigate Roblox's data model correctly. Use when placing scripts, choosing containers, or reasoning about what replicates where.
---

# Roblox Data Model

## Service map

| Service | Runs | Contains |
|---|---|---|
| ServerScriptService | Server | server Scripts |
| ServerStorage | Server | server-only assets, modules, tools |
| ReplicatedStorage | Both (replicated) | shared ModuleScripts, RemoteEvents/Functions, shared assets |
| Workspace | Both (replicated) | 3D world visible to clients |
| StarterPlayer > StarterPlayerScripts | Client | player LocalScripts |
| StarterGui | Client | ScreenGuis given to each player |
| StarterPack | Client | Tools given to each player |

## Placement rules

- Scripts go in ServerScriptService (via `src/server`). LocalScripts go in StarterPlayerScripts or StarterGui (via `src/client`). ModuleScripts go wherever their consumers are; shared ones live in ReplicatedStorage (`src/shared`).
- Never put a LocalScript in a server container; it will not run. Never put a Script in a client container and expect server authority.
- Anything replicated to the client is readable by exploiters. Never store secrets, admin logic, or unreleased content in Workspace or ReplicatedStorage.

## Client/server boundary

- The client and server each simulate their own world. The server is the authority for gameplay state, currency, inventory, and progression.
- Changes made on the client to replicated objects do not replicate back to the server (filtering enabled is the only mode).
- All gameplay actions triggered by the client must be re-validated on the server: check types, ranges, cooldowns, distances, and ownership before applying effects.

## Replication notes

- Properties of replicated instances sync server to client automatically; use this instead of remotes for slow-changing state.
- Creating instances on the server replicates them; creating them on the client keeps them local (useful for effects).
- Use CollectionService tags to find gameplay objects instead of hardcoding paths or scanning all descendants.
