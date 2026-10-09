---
name: rojo-workflow
description: Work with Rojo-based Roblox projects. Use when scaffolding, structuring, or syncing a Rojo project with Studio.
---

# Rojo Workflow

## What Rojo is

Rojo syncs files on disk into Roblox Studio in real time. `project.json` describes how folders map into the DataModel. The Studio Rojo plugin connects to `rojo serve`.

## project.json essentials

- `name`: the project name.
- `tree`: maps DataModel paths to folders. Each node needs `$className` (e.g. DataModel, ReplicatedStorage, ServerScriptService, StarterPlayer, StarterPlayerScripts).
- Folders map with `$path`: `{ "$path": "src/server" }`.
- File extensions decide instance class: `.server.luau` becomes a Script, `.client.luau` becomes a LocalScript, `.luau` becomes a ModuleScript.

## Standard layout (StudioPilot convention)

```
project.json
src/
  server/   -> ServerScriptService  (*.server.luau)
  client/   -> StarterPlayerScripts (*.client.luau)
  shared/   -> ReplicatedStorage    (*.luau ModuleScripts)
```

## Commands

- `rojo serve` — start the sync server; connect from the Studio plugin.
- `rojo build -o game.rbxlx` — build a place file for CI or publishing.
- Keep `project.json` in sync with the folder layout; run the `validate_project` MCP tool after structural changes.

## .gitignore for Rojo projects

```
/build
*.rbxlx
*.rbxl
```

Never commit built place files. Never commit `local.packages` or machine-specific Rojo config.

## Agent rules

1. Edit files on disk, never try to edit through Studio while Rojo is syncing the same tree.
2. After adding or moving folders, update `project.json` and re-run `rojo serve`.
3. Keep one responsibility per ModuleScript; entry-point Scripts stay thin.
