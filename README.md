# /dg — Dinesh vs Gilfoyle Code Review

An adversarial code review skill for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) inspired by HBO's Silicon Valley.

Two AI agents — **Gilfoyle** (attacker) and **Dinesh** (defender) — debate your code in character. The banter is entertaining. The findings are real.

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

### Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI installed and configured

### Install

```bash
# Clone the repo
git clone https://github.com/v1r3n/dinesh-gilfoyle.git

# Symlink into your Claude Code skills directory
ln -s "$(pwd)/dinesh-gilfoyle/dg" ~/.claude/skills/dg
```

### Verify

Start a new Claude Code session and type `/dg`. If it loads the skill, you're good.

## Usage

```
/dg                     # Review git diff (staged + unstaged)
/dg 3                   # Review git diff, max 3 rounds
/dg src/auth.ts         # Review a specific file
/dg src/auth.ts 3       # Specific file, max 3 rounds
```

### Default Behavior

- Rounds: **adaptive** — agents debate until convergence or cap is hit
- Default cap: **5 rounds**
- At cap: you're asked whether to continue or wrap up

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
dg/
  SKILL.md              # Orchestrator — runs the debate loop
  gilfoyle-agent.md     # Gilfoyle's system prompt (attacker)
  dinesh-agent.md       # Dinesh's system prompt (defender)
```

The orchestrator dispatches two independent subagents in a sequential loop. Gilfoyle attacks first, Dinesh responds. Each round, the orchestrator checks for convergence — if no new issues are raised or all points are conceded, the debate ends. A structured summary is produced at the end.

## Contributing

PRs welcome. If you have ideas for improving the personas, the debate flow, or the output format, open an issue or submit a PR.

## License

MIT
