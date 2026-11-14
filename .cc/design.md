# Issue #2 team brief

## Applicable design documents

- `design/architecture.md` defines the installer boundary, detection rules, target paths,
  and the asset bundle for every supported client.
- `design/spec/DgInstaller.tla`, `design/spec/DgInstaller.cfg`, and
  `design/spec/abstraction.json` formalize the full-integration bundle postcondition.

## Contract the checks use

The public command is exactly `bash docs/install.sh`. It takes no arguments and requires
no port. The check supplies an isolated `HOME`, a PATH containing deterministic client
stubs, and a fixture response for the installer's archive download; production behavior
continues to download `https://github.com/v1r3n/dinesh-gilfoyle/archive/main.tar.gz`.

When the client is detected, the command must create these exact full-integration target
paths and place these four files in each one:

- Claude Code: `$HOME/.claude/skills/dg/SKILL.md`,
  `$HOME/.claude/skills/dg/gilfoyle-agent.md`,
  `$HOME/.claude/skills/dg/dinesh-agent.md`, and
  `$HOME/.claude/skills/dg/comic-template.html`.
- Codex CLI: `$HOME/.codex/skills/dg/SKILL.md`,
  `$HOME/.codex/skills/dg/gilfoyle-agent.md`,
  `$HOME/.codex/skills/dg/dinesh-agent.md`, and
  `$HOME/.codex/skills/dg/comic-template.html`.
- OpenCode: `$HOME/.config/opencode/skills/dg/SKILL.md`,
  `$HOME/.config/opencode/skills/dg/gilfoyle-agent.md`,
  `$HOME/.config/opencode/skills/dg/dinesh-agent.md`, and
  `$HOME/.config/opencode/skills/dg/comic-template.html`.

The first acceptance assertion is the issue reproduction: after a Claude Code-only run,
`$HOME/.claude/skills/dg/comic-template.html` must exist and its bytes must equal
`dg/comic-template.html`. The current `main` implementation fails this assertion.

The same byte-for-byte template assertion applies to Codex CLI and OpenCode in isolated
runs. Existing behavior for Cursor and Windsurf is unchanged: detected Cursor receives
`$HOME/.cursor/dg.mdc`, and detected Windsurf receives
`$HOME/.codeium/windsurf/rules/dg.md`.

The user-visible invocation labels remain `/dg` for Claude Code and OpenCode and `$dg` for
Codex CLI. The installer output continues to identify detected clients and ends with the
visible text `Ready to review. Gilfoyle is already disappointed.`
