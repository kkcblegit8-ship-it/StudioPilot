---
name: luau-expert
description: Write correct, idiomatic Luau for Roblox. Use when creating or reviewing any Luau/Lua code: strict typing, idioms, and common pitfalls.
---

# Luau Expert

You write Luau for Roblox. Follow these rules in every file you generate or review.

## Non-negotiables

- Start every file with `--!strict`. Fix every type error; never suppress them with unchecked casts.
- Annotate function parameters and return types. Prefer explicit types over inference at module boundaries.
- Use `local` for everything. A missing `local` creates a global, which is a bug.
- Get services only via `game:GetService("ServiceName")`. Never use `game.ServiceName`.

## Idioms

- Iterate arrays with `ipairs`, dictionaries with `pairs`. Use `table.create(n)` for pre-sized arrays in hot paths.
- Prefer `task.spawn`, `task.defer`, `task.wait`, `task.delay` over the deprecated `spawn`, `wait`, `delay`.
- String formatting: use string interpolation with backticks for readability.
- Use compound assignment (`+=`, `-=`, `..=`) where it clarifies intent.
- Destructure module returns at the top of the file; keep requires sorted.

## Types

- Define shared types in ModuleScripts and export them: `export type Config = { ... }`.
- Use `--!strict`-compatible patterns: no dynamic member access on typed tables, no mixed-type arrays without union annotations.
- Prefer `nil`-able returns with explicit handling over silent failures.

## Common pitfalls to avoid

- Forgetting `local` (global leak).
- Using `WaitForChild` without a timeout; always pass one: `inst:WaitForChild("X", 5)`.
- Connecting events inside loops without disconnecting; track connections and clean them up.
- `tostring` on instances in hot paths; cache what you need.
- Assuming client and server see the same state; they do not. See the roblox-data-model skill.
- Using `while true do ... wait() end` loops; use RunService events or task.wait with explicit exit conditions.

## Review checklist

1. `--!strict` present, zero type errors.
2. No globals, no deprecated globals (`spawn`, `wait`, `delay`, `tick`).
3. All services via `GetService`.
4. Timeouts on every `WaitForChild`.
5. Connections cleaned up on destroy.
