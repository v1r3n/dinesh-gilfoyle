#!/bin/bash
# /dg — Dinesh vs Gilfoyle Code Review
# One-liner: curl -sL https://raw.githubusercontent.com/v1r3n/dinesh-gilfoyle/main/install.sh | bash

set -e

REPO_URL="https://github.com/v1r3n/dinesh-gilfoyle/archive/main.tar.gz"
TMP_DIR=$(mktemp -d)
INSTALLED=()
MANUAL=()

echo ""
echo "  /dg — Dinesh vs Gilfoyle Code Review"
echo "  ======================================"
echo ""
echo "  Downloading..."

curl -sL "$REPO_URL" | tar xz -C "$TMP_DIR"
SRC="$TMP_DIR/dinesh-gilfoyle-main"

# ── Claude Code ──────────────────────────────────────────────
if command -v claude &>/dev/null || [ -d "$HOME/.claude" ]; then
    echo "  ✓ Claude Code detected"
    mkdir -p "$HOME/.claude/skills/dg"
    cp "$SRC/dg/SKILL.md" "$HOME/.claude/skills/dg/"
    cp "$SRC/dg/gilfoyle-agent.md" "$HOME/.claude/skills/dg/"
    cp "$SRC/dg/dinesh-agent.md" "$HOME/.claude/skills/dg/"
    INSTALLED+=("Claude Code    → ~/.claude/skills/dg/          invoke: /dg")
fi

# ── Codex CLI (OpenAI) ──────────────────────────────────────
if command -v codex &>/dev/null || [ -d "$HOME/.codex" ]; then
    echo "  ✓ Codex CLI detected"
    mkdir -p "$HOME/.codex/skills/dg"
    cp "$SRC/dg/SKILL.md" "$HOME/.codex/skills/dg/"
    cp "$SRC/dg/gilfoyle-agent.md" "$HOME/.codex/skills/dg/"
    cp "$SRC/dg/dinesh-agent.md" "$HOME/.codex/skills/dg/"
    INSTALLED+=("Codex CLI      → ~/.codex/skills/dg/           invoke: \$dg")
fi

# ── OpenCode ─────────────────────────────────────────────────
if command -v opencode &>/dev/null || [ -d "$HOME/.config/opencode" ]; then
    echo "  ✓ OpenCode detected"
    mkdir -p "$HOME/.config/opencode/skills/dg"
    cp "$SRC/dg/SKILL.md" "$HOME/.config/opencode/skills/dg/"
    cp "$SRC/dg/gilfoyle-agent.md" "$HOME/.config/opencode/skills/dg/"
    cp "$SRC/dg/dinesh-agent.md" "$HOME/.config/opencode/skills/dg/"
    INSTALLED+=("OpenCode       → ~/.config/opencode/skills/dg/ invoke: /dg")
fi

# ── Cursor (project-level only — no global rules dir) ───────
if command -v cursor &>/dev/null || [ -d "$HOME/.cursor" ]; then
    echo "  ✓ Cursor detected"
    echo "    Cursor rules are project-level. Saving template to ~/.cursor/dg.mdc"
    mkdir -p "$HOME/.cursor"
    cp "$SRC/cursor/dg.mdc" "$HOME/.cursor/dg.mdc"
    MANUAL+=("Cursor         → Copy ~/.cursor/dg.mdc to .cursor/rules/dg.mdc in any project")
fi

# ── Windsurf ─────────────────────────────────────────────────
if command -v windsurf &>/dev/null || [ -d "$HOME/.codeium/windsurf" ]; then
    echo "  ✓ Windsurf detected"
    mkdir -p "$HOME/.codeium/windsurf/rules"
    cp "$SRC/windsurf/dg.md" "$HOME/.codeium/windsurf/rules/dg.md"
    INSTALLED+=("Windsurf       → ~/.codeium/windsurf/rules/dg.md")
fi

# ── Cleanup ──────────────────────────────────────────────────
rm -rf "$TMP_DIR"

# ── Summary ──────────────────────────────────────────────────
echo ""
if [ ${#INSTALLED[@]} -eq 0 ] && [ ${#MANUAL[@]} -eq 0 ]; then
    echo "  No supported agents detected."
    echo ""
    echo "  Supported agents:"
    echo "    • Claude Code   (full two-agent debate)"
    echo "    • Codex CLI     (full two-agent debate)"
    echo "    • OpenCode      (full two-agent debate)"
    echo "    • Cursor        (single-agent structured review)"
    echo "    • Windsurf      (single-agent structured review)"
    echo ""
    echo "  Manual install: https://github.com/v1r3n/dinesh-gilfoyle#installation"
else
    if [ ${#INSTALLED[@]} -gt 0 ]; then
        echo "  Installed:"
        for i in "${INSTALLED[@]}"; do
            echo "    $i"
        done
    fi
    if [ ${#MANUAL[@]} -gt 0 ]; then
        echo ""
        echo "  Manual step needed:"
        for i in "${MANUAL[@]}"; do
            echo "    $i"
        done
    fi
fi

echo ""
echo "  Ready to review. Gilfoyle is already disappointed."
echo ""
