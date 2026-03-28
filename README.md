# /dg — Dinesh vs Gilfoyle Code Review

An adversarial code review skill inspired by HBO's Silicon Valley.

Two AI agents — **Gilfoyle** (attacker) and **Dinesh** (defender) — debate your code in character. The banter is entertaining. The findings are real.

Works with **Claude Code**, **Codex CLI**, **OpenCode**, **Cursor**, and **Windsurf**.

## How It Works

```
You run /dg
    │
    ▼
Gilfoyle reviews your code
    "Line 47. A raw SQL query with string concatenation.
     I genuinely can't tell if you're lazy or if you've
     never heard of parameterized queries."
    │
    ▼
Dinesh defends it
    "That endpoint is behind three layers of auth middleware,
     which you'd KNOW if you'd looked at the router config
     instead of just grep-ing for 'sql'."
    │
    ▼
They go back and forth until one wins or they run out of things to argue about
    │
    ▼
You get an actionable summary + a checklist of what to fix
```

**Why adversarial review works:**
- When Dinesh **can't defend** a point → it's a real issue
- When Dinesh **successfully defends** → the code is validated under pressure
- The debate surfaces issues a single reviewer would miss

## Installation

### One-liner (auto-detects your agents)

```bash
curl -sL https://raw.githubusercontent.com/v1r3n/dinesh-gilfoyle/main/install.sh | bash
```

The installer detects which coding agents you have and installs for each one automatically.

### Manual Install

<details>
<summary><b>Claude Code</b></summary>

```bash
mkdir -p ~/.claude/skills/dg
curl -sL https://raw.githubusercontent.com/v1r3n/dinesh-gilfoyle/main/dg/SKILL.md -o ~/.claude/skills/dg/SKILL.md
curl -sL https://raw.githubusercontent.com/v1r3n/dinesh-gilfoyle/main/dg/gilfoyle-agent.md -o ~/.claude/skills/dg/gilfoyle-agent.md
curl -sL https://raw.githubusercontent.com/v1r3n/dinesh-gilfoyle/main/dg/dinesh-agent.md -o ~/.claude/skills/dg/dinesh-agent.md
```

Invoke with `/dg` in any session.
</details>

<details>
<summary><b>Codex CLI</b></summary>

```bash
mkdir -p ~/.codex/skills/dg
curl -sL https://raw.githubusercontent.com/v1r3n/dinesh-gilfoyle/main/dg/SKILL.md -o ~/.codex/skills/dg/SKILL.md
curl -sL https://raw.githubusercontent.com/v1r3n/dinesh-gilfoyle/main/dg/gilfoyle-agent.md -o ~/.codex/skills/dg/gilfoyle-agent.md
curl -sL https://raw.githubusercontent.com/v1r3n/dinesh-gilfoyle/main/dg/dinesh-agent.md -o ~/.codex/skills/dg/dinesh-agent.md
```

Invoke with `$dg` in any session.
</details>

<details>
<summary><b>OpenCode</b></summary>

```bash
mkdir -p ~/.config/opencode/skills/dg
curl -sL https://raw.githubusercontent.com/v1r3n/dinesh-gilfoyle/main/dg/SKILL.md -o ~/.config/opencode/skills/dg/SKILL.md
curl -sL https://raw.githubusercontent.com/v1r3n/dinesh-gilfoyle/main/dg/gilfoyle-agent.md -o ~/.config/opencode/skills/dg/gilfoyle-agent.md
curl -sL https://raw.githubusercontent.com/v1r3n/dinesh-gilfoyle/main/dg/dinesh-agent.md -o ~/.config/opencode/skills/dg/dinesh-agent.md
```

Invoke with `/dg` in any session.
</details>

<details>
<summary><b>Cursor</b></summary>

```bash
# Copy to your project (Cursor rules are project-level)
mkdir -p .cursor/rules
curl -sL https://raw.githubusercontent.com/v1r3n/dinesh-gilfoyle/main/cursor/dg.mdc -o .cursor/rules/dg.mdc
```

Invoke with `@dg` in chat, or it triggers when you ask for a code review.
</details>

<details>
<summary><b>Windsurf</b></summary>

```bash
mkdir -p ~/.codeium/windsurf/rules
curl -sL https://raw.githubusercontent.com/v1r3n/dinesh-gilfoyle/main/windsurf/dg.md -o ~/.codeium/windsurf/rules/dg.md
```

Ask for a `/dg` or "dinesh gilfoyle review" in Cascade.
</details>

### Agent Compatibility

| Agent | Experience | Install Scope | Invoke |
|-------|-----------|---------------|--------|
| **Claude Code** | Full two-agent debate | Global | `/dg` |
| **Codex CLI** | Full two-agent debate | Global | `$dg` |
| **OpenCode** | Full two-agent debate | Global | `/dg` |
| **Cursor** | Structured single-agent review | Per-project | `@dg` |
| **Windsurf** | Structured single-agent review | Global | ask in chat |

Agents with subagent support (Claude Code, Codex, OpenCode) get the full experience — two independent agents arguing. Cursor and Windsurf get a single-agent adaptation that alternates personas within one session.

## Usage

```
/dg                     # Review git diff (staged + unstaged)
/dg 3                   # Review git diff, max 3 rounds
/dg src/auth.ts         # Review a specific file
/dg src/auth.ts 3       # Specific file, max 3 rounds
```

- Rounds: **adaptive** — debate continues until convergence or cap
- Default cap: **5 rounds**
- At cap: you choose whether to continue or wrap up

## Sample Output

```
## Dinesh vs Gilfoyle Review — src/auth.ts
### 3 rounds of mass destruction

---
### Best of the Banter

GILFOYLE: "You've implemented your own JWT verification.
A solved problem with battle-tested libraries. But no,
Dinesh had to reinvent cryptography. What could go wrong."

DINESH: "It's not 'reinventing cryptography,' it's a thin
wrapper around jose with custom claims validation. Which
you'd know if you read past line 12."

GILFOYLE: "I stopped at line 12 because that's where the
vulnerability is."

---

### Verdict

#### Critical
- `auth.ts:12` — JWT secret loaded from env without fallback.
  If env var is missing, server starts with undefined secret.
  Fix: fail fast on startup if JWT_SECRET is not set.

#### Contested
- `auth.ts:45` — Dinesh correctly noted the custom claims
  validation is required by the OAuth provider's non-standard
  token format. Defense holds.

### Recommended Changes
- [ ] `auth.ts:12` — Add startup check for JWT_SECRET env var
- [ ] `auth.ts:38` — Add token expiry validation

### Score
Gilfoyle: 2 | Dinesh: 1
```

## Architecture

```
dg/                        # Shared SKILL.md format (Claude Code, Codex, OpenCode)
  SKILL.md                 # Orchestrator — debate loop + synthesis
  gilfoyle-agent.md        # Gilfoyle subagent prompt (attacker)
  dinesh-agent.md          # Dinesh subagent prompt (defender)
cursor/
  dg.mdc                   # Cursor rules adaptation (single-agent)
windsurf/
  dg.md                    # Windsurf rules adaptation (single-agent)
install.sh                 # Universal installer
```

## Contributing

PRs welcome. Ideas for improving the personas, debate flow, output format, or adding support for more agents — open an issue or submit a PR.

## License

MIT
