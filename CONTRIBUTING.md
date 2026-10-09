# Contributing to StudioPilot

Thanks for your interest in contributing. This guide keeps the project
consistent and reviewable.

## Getting started

```bash
git clone https://github.com/kkcblegit8-ship-it/StudioPilot.git
cd StudioPilot
npm install
npm run build
npm test
```

Requirements: Node.js 18 or newer.

## What to work on

- New MCP tools that solve real Roblox agent pain points
- New or improved skills (Luau, Roblox APIs, workflows)
- Bug fixes with a reproducing test
- Documentation improvements

Check open issues for ideas, or open one to propose a feature before writing
code.

## Code standards

- TypeScript in strict mode. No `any` without a comment explaining why.
- Every MCP tool lives in `src/mcp/tools/`, exports a `ToolDefinition`,
  and is registered in `src/mcp/index.ts`.
- Tool handlers return markdown text, never throw on bad input. Validate
  with zod schemas and return helpful error messages.
- Skills are `SKILL.md` files with `name` and `description` frontmatter.
  Keep them focused: one topic per skill, checklists over prose.

## Tests

Add tests for new tools and templates in `src/test/` using `node:test`.
Run the suite with `npm test`. CI runs build plus tests on every push.

## Pull requests

1. Fork the repo and create a branch: `git checkout -b feat/my-tool`.
2. Add code, tests, and docs (README tool table if you add a tool).
3. Update CHANGELOG.md under "Unreleased".
4. Open a PR describing what changed and why.

## Release process

Maintainers only: bump `version` in package.json, add a CHANGELOG entry,
tag `vX.Y.Z`, and GitHub Actions publishes to npm.
