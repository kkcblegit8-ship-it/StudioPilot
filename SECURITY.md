# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| 0.1.x | Yes |

## Reporting a vulnerability

StudioPilot is a developer tool that runs locally and executes shell commands
(StyLua, Selene) and file operations on your machine. Treat it like any build
tool: only run versions you trust, and review MCP tool calls from agents
before approving destructive ones.

If you find a security issue, please open a GitHub issue describing it.
Do not include exploits against live systems. We aim to acknowledge reports
within 7 days.

## Scope notes

- The MCP server never makes network requests and never exfiltrates data.
- `lint_luau` and `format_luau` shell out to locally installed `stylua` /
  `selene` binaries only.
- No telemetry, no analytics, no phone-home of any kind.
