# /dg

/dg is an adversarial code review skill for your coding agent, inspired by the Dinesh-Gilfoyle dynamic from HBO's Silicon Valley.

## How it works

When you run `/dg`, your agent doesn't just do a standard code review. Instead, it spins up *two independent AI agents* — one playing Gilfoyle, one playing Dinesh — and makes them argue about your code.

Gilfoyle goes first. He reviews your code with the deadpan, withering precision of a systems engineer who considers bad code a moral failing. He finds the real issues — security vulnerabilities, architectural rot, performance problems — and delivers them wrapped in devastating commentary.

Then Dinesh gets his turn. He defends the code like his reputation depends on it (because it does). He concedes when Gilfoyle is genuinely right — grudgingly — but pushes back hard when the criticism is unfair. He cites constraints, context, and documentation that Gilfoyle conveniently ignored.

They go back and forth. Round after round, until one of them runs out of new things to say, or you decide you've heard enough. The debate is *adaptive* — it keeps going as long as new issues are being surfaced, with a default cap of 5 rounds.

When it's over, you get an actionable summary: what to fix, what's actually fine, and the funniest exchanges from the banter. Because code review shouldn't be a chore.

**Why this works:** When Dinesh can't defend a point, that's a *confirmed* issue — not a "maybe." When he successfully defends, the code has been validated under pressure, which is stronger than any "LGTM." The adversarial tension surfaces things a single reviewer would miss.

## Installation

```bash
curl -sL https://v1r3n.github.io/dinesh-gilfoyle/install.sh | bash
```

That's it. The installer auto-detects which coding agents you have — Claude Code, Codex, OpenCode, Cursor, Windsurf — and sets up /dg for each one.

Start a new session and type `/dg`. If Gilfoyle insults your code, you're good.

## Usage

```
/dg                     Review your git diff
/dg 3                   Git diff, max 3 rounds
/dg src/auth.ts         Review a specific file
/dg src/auth.ts 3       Specific file, 3 rounds max
```

## The Debate

1. **Gilfoyle attacks** — Reviews the code with devastating technical precision. Finds security issues, bugs, architectural flaws. Scans dependencies for known CVEs. Delivers findings in character.
2. **Dinesh defends** — Responds to each critique. Concedes real issues (grudgingly), pushes back on unfair criticism, dismisses nitpicks.
3. **Repeat** — They go back and forth until no new issues are raised, Dinesh concedes everything, or the round cap is hit.
4. **Verdict** — A structured summary categorizes every issue by who won the argument, plus a clean checklist of what to actually fix.
5. **Comic strip** — Optionally generates an HTML comic strip of the best moments, with SVG character avatars and speech bubbles. Can be attached directly to a PR.

## Agent Compatibility

| Agent | Experience | Invoke |
|-------|-----------|--------|
| **Claude Code** | Full two-agent debate | `/dg` |
| **Codex CLI** | Full two-agent debate | `$dg` |
| **OpenCode** | Full two-agent debate | `/dg` |
| **Cursor** | Structured single-agent review | `@dg` |
| **Windsurf** | Structured single-agent review | ask in chat |

Agents with subagent support (Claude Code, Codex, OpenCode) get the full experience — two independent agents with separate contexts arguing in real time. Cursor and Windsurf get a single-agent adaptation that alternates personas. Same banter, same findings.

## What's Inside

**Core skill** — `dg/SKILL.md` — The orchestrator. Parses arguments, runs the debate loop, detects convergence, synthesizes the final review with banter highlights and actionable checklist.

**Gilfoyle agent** — `dg/gilfoyle-agent.md` — Deadpan, dry, supremely confident. Finds real issues and scales his contempt to the severity. Never uses exclamation marks.

**Dinesh agent** — `dg/dinesh-agent.md` — Defensive, flustered, but genuinely competent. Concedes when wrong, fights hard when right. Occasionally lands a zinger.

**Comic template** — `dg/comic-template.html` — Self-contained HTML comic strip with inline SVG character avatars, speech bubbles, score card, and verdict. Generates a shareable artifact you can attach to PRs.

**Cursor rules** — `cursor/dg.mdc` — Single-agent adaptation for Cursor's .mdc rules format.

**Windsurf rules** — `windsurf/dg.md` — Single-agent adaptation for Windsurf's rules format.

**Installer** — `install.sh` — Auto-detects agents, installs the right files in the right places.

## Philosophy

- **Adversarial > cooperative** — Two perspectives that genuinely disagree produce better reviews than one that agrees with itself
- **Entertainment > obligation** — If the review is fun to read, you'll actually read all of it
- **Concessions are signal** — The strongest finding is one the defender couldn't argue against
- **Substance over style** — The humor only works when the technical critique is real

## Contributing

PRs welcome. If you want to sharpen the personas, improve convergence detection, tune the output format, or add support for another agent — open an issue or submit a PR.

## License

MIT
