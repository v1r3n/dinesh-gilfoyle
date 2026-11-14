# Installer architecture

## Scope

This repository distributes the `/dg` review experience as static assets. There is no
long-running service. The public installation entry point is `docs/install.sh`, which is
published by GitHub Pages as `https://v1r3n.github.io/dinesh-gilfoyle/install.sh` and is
normally invoked with:

```bash
curl -sL https://v1r3n.github.io/dinesh-gilfoyle/install.sh | bash
```

The installer downloads the `main` source archive into a temporary directory, detects
locally available coding agents, copies the assets for each detected agent, prints a
summary, and removes the temporary directory.

## Components and directory layout

- `docs/install.sh`: the executable installation orchestrator and the only code changed
  by issue #2.
- `dg/`: the complete asset bundle used by full two-agent integrations:
  `SKILL.md`, `gilfoyle-agent.md`, `dinesh-agent.md`, and `comic-template.html`.
- `cursor/dg.mdc`: the standalone Cursor rule.
- `windsurf/dg.md`: the standalone Windsurf rule.
- `.claude/INSTALL.md`, `.codex/INSTALL.md`, `.opencode/INSTALL.md`: manual-install
  instructions for the full integrations.
- `.cursor/INSTALL.md`, `.windsurf/INSTALL.md`: manual-install instructions for the
  standalone integrations.

## Installer interface

The script has no arguments, ports, or application-specific environment variables. It
uses the standard `HOME` environment variable to locate installation targets and PATH
lookups to detect agent commands. A client is considered detected when either its command
exists or its conventional configuration directory exists.

| Client | Detection | Installed target | Required source assets |
| --- | --- | --- | --- |
| Claude Code | `claude` or `$HOME/.claude` | `$HOME/.claude/skills/dg/` | all four files in `dg/` |
| Codex CLI | `codex` or `$HOME/.codex` | `$HOME/.codex/skills/dg/` | all four files in `dg/` |
| OpenCode | `opencode` or `$HOME/.config/opencode` | `$HOME/.config/opencode/skills/dg/` | all four files in `dg/` |
| Cursor | `cursor` or `$HOME/.cursor` | `$HOME/.cursor/dg.mdc` | `cursor/dg.mdc` |
| Windsurf | `windsurf` or `$HOME/.codeium/windsurf` | `$HOME/.codeium/windsurf/rules/dg.md` | `windsurf/dg.md` |

For each full integration, the installed directory is a self-contained bundle. In
particular, `SKILL.md` resolves `comic-template.html` relative to its own directory, so
copying the skill without the template is an invalid partial installation. The template
must be copied by the same detected-client branch as the skill and persona files.

Example postcondition for a detected Codex installation:

```text
$HOME/.codex/skills/dg/
├── SKILL.md
├── comic-template.html
├── dinesh-agent.md
└── gilfoyle-agent.md
```

The installer is safe to run repeatedly: `mkdir -p` preserves the target and `cp`
replaces the four managed files with the current release. Existing unrelated files in a
target directory are not deleted.

## Important decisions

1. Keep explicit copy commands in each full-integration branch. The bundle is only four
   named files, and explicit names make the release contract reviewable while avoiding
   accidental installation of future notes or unsupported file types.
2. Apply the template requirement only to Claude Code, Codex CLI, and OpenCode. Cursor and
   Windsurf use standalone rule files that do not execute `dg/SKILL.md` Step 4.
3. Test installation through the shell script's public boundary with an isolated `HOME`
   and a local archive fixture. This observes the actual directory layout without writing
   to a developer's real configuration directories or relying on the network.

## Use after installation

Start a new client session, then invoke `/dg` in Claude Code or OpenCode, or `$dg` in
Codex CLI. After a review, choosing `y` or `pr` at the comic prompt reads the installed
`comic-template.html`; no additional download is required.
