# StudioPilot

[![npm version](https://img.shields.io/npm/v/studiopilot.svg)](https://www.npmjs.com/package/studiopilot)
[![CI](https://github.com/kkcblegit8-ship-it/StudioPilot/actions/workflows/ci.yml/badge.svg)](https://github.com/kkcblegit8-ship-it/StudioPilot/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**The agent toolkit for Roblox development.** StudioPilot gives AI coding agents
(Claude Code, Cursor, and any MCP client) the tools and knowledge they need to
build Roblox games correctly: a Model Context Protocol server, expert skills,
and one-command project scaffolding.

AI agents are great at code but terrible at Roblox specifics. They hallucinate
APIs, put LocalScripts in server containers, trust the client, and skip Rojo
conventions. StudioPilot fixes that at the source.

## What's inside

| Piece | What it does |
|---|---|
| **MCP server** (`studiopilot-mcp`) | 6 tools: scaffold projects, generate scripts, lint/format Luau, validate Rojo structure, and a conventions reference |
| **Claude Code skills** (`skills/`) | 4 expert knowledge packs: Luau, data model, UI, Rojo workflow |
| **CLI** (`studiopilot`) | `studiopilot init my-game` scaffolds an agent-ready project with AGENTS.md, skills, and MCP config |

## Quickstart

```bash
# Scaffold a new Roblox game project
npx studiopilot init my-game
cd my-game

# Serve it to Roblox Studio with Rojo
rojo serve
```

The generated project includes `AGENTS.md` (conventions for AI agents),
`.claude/skills` (the expert packs), and `.mcp.json` (Claude Code will offer
to load the MCP server automatically).

## MCP setup

**Claude Code** — the `studiopilot init` command writes `.mcp.json` for you.
Or add it manually:

```json
{
  "mcpServers": {
    "studiopilot": { "command": "npx", "args": ["-y", "studiopilot-mcp"] }
  }
}
```

**Cursor / other MCP clients** — point them at the same command:
`npx -y studiopilot-mcp` over stdio.

## Tools reference

| Tool | Description |
|---|---|
| `scaffold_project` | Create a Rojo-structured project (project.json, src/server, src/client, src/shared, starter scripts, README, AGENTS.md) |
| `create_script` | Generate a Script, LocalScript, or ModuleScript with `--!strict` header and idiomatic boilerplate |
| `lint_luau` | Lint with StyLua `--check` and Selene when installed; install guidance otherwise |
| `format_luau` | Format files in place with StyLua |
| `validate_project` | Validate project.json, every `$path` in the tree, and the conventional layout |
| `get_conventions` | Curated reference: networking, data-model, UI, and performance conventions |

## Skills

Each skill is a `SKILL.md` file loadable by Claude Code and compatible agents:

- **luau-expert** — strict typing, idioms, and the pitfalls checklist every file must pass
- **roblox-data-model** — service map, script placement, client/server boundary, replication
- **roblox-ui** — responsive layout, TweenService animation, input safety
- **rojo-workflow** — project.json, sync workflow, agent rules for Rojo projects

## Requirements

- Node.js 18+
- For linting/formatting: [StyLua](https://github.com/JohnnyMorganz/StyLua) and/or [Selene](https://github.com/Kampfkarren/selene)
- For syncing to Studio: [Rojo](https://rojo.space/)

## Development

```bash
npm install
npm run build     # compile TypeScript to dist/
npm test          # run the test suite
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

## Why this exists

Roblox has hundreds of millions of users and a growing wave of AI-assisted
game development, but almost no tooling that teaches agents how Roblox actually
works. StudioPilot is that missing layer: practical, opinionated, and built
from real Roblox development workflows.

## How it relates to Roblox's official Studio MCP

Roblox's official MCP server bridges AI assistants into a live Studio session:
it can read and edit the open place. StudioPilot is the layer underneath that
makes the generated code correct in the first place: project scaffolding, Luau
conventions, client/server boundary rules, linting, and expert skills. They
complement each other. StudioPilot produces correct code and structure; the
Studio MCP puts it into your live game. Use both.

## License

MIT. See [LICENSE](LICENSE).
