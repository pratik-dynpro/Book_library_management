# D4 · Enforcement (`.claude/` rules, hooks, gates)

The framework relies on automation to keep discipline cheap. This document specifies the hooks and config that live under `.claude/` at repo root.

## 1. Directory Layout

```
.claude/
├── settings.json          # permissions + hooks
├── settings.local.json    # user-specific overrides (gitignored)
└── rules/
    ├── no-evidence-edit.md
    └── no-direct-session.md
```

## 2. Hook Plan (`.claude/settings.json`)

| Trigger | Action | Why |
|---------|--------|-----|
| `PostToolUse` on `Edit/Write` of `*.py` | run `ruff check --fix` then `ruff format` | Keep Python lint green |
| `PostToolUse` on `Edit/Write` of `*.{js,jsx}` | run `eslint --fix` then `prettier --write` | Keep JS lint green |
| `Stop` in a backend packet branch | run `cd backend && pytest -q` | Catch regressions before evidence is written |
| `PreToolUse` on `Edit/Write` of `packets/**/Evidence.md` | block unless `CLAUDE_SESSION=qa` | Build sessions must not author evidence |
| `PreToolUse` on `Bash` matching `git commit --no-verify` | block | T-no-bypass |
| `PreToolUse` on `Bash` matching `rm -rf` outside scratchpad | block | Destructive-action guard |

## 3. Permissions (`.claude/settings.json`)

Allow without prompt:
- `Bash(ruff *)`, `Bash(pytest *)`, `Bash(npm *)`, `Bash(node *)`, `Bash(uvicorn *)`, `Bash(eslint *)`, `Bash(prettier *)`
- `Bash(git status)`, `Bash(git diff)`, `Bash(git log *)`, `Bash(git add *)`, `Bash(git commit *)`

Require confirmation:
- Any `Bash` matching `rm -rf`, `git push`, `git reset --hard`, `git checkout --`.

## 4. Skills Wired

Universal (every packet):
- `superpowers:test-driven-development` — invoked at the start of every build packet.
- `superpowers:systematic-debugging` — invoked when any test failure persists more than one cycle.
- `superpowers:verification-before-completion` — invoked at the close of every packet, before evidence.

Frontend packets (S-008 — S-012) additionally MUST invoke, in this order, **before any JSX is written**:
- `frontend-design` — sets visual direction, palette, typography intent.
- `ui-ux-pro-max` — locks the chosen catalog palette / font pairing / UX patterns / accessibility rules.

A frontend BUILD session that authors JSX without first running both frontend skills is treated as a failed packet and bounced (RED).

## 5. Gates

- **Packet gate:** `packets/S-NNN-*/Evidence.md` exists AND its "Verdict" line equals `GREEN`.
- **Feature gate:** all packets in a feature green; feature integration QA section appended to the feature's lead packet Evidence.
- **Module gate:** all features in a module green; module integration QA recorded.
- **Product gate:** S-013 green; clean-clone smoke documented in S-013 Evidence.

## 6. CI Job (`.github/workflows/ci.yml`, defined in S-013)

| Stage | Command | Must pass to merge? |
|-------|---------|---------------------|
| lint:py | `ruff check backend` | Yes |
| lint:js | `cd frontend && npm run lint` | Yes |
| migrate | `alembic upgrade head` against the CI Postgres service container | Yes |
| test:py | `cd backend && pytest -q` (Postgres-backed) | Yes |
| test:js | `cd frontend && npm test -- --run` | Yes |
| audit:py | `pip-audit` | Yes |
| audit:js | `npm audit --omit=dev` | Warn only in v1 |

The backend job declares a `services: postgres:16` block; `DATABASE_URL` is exported from the service's address.

Trunk-based merge rule (per D5/Stage-4): a packet merges to `main` only when its CI is fully green.
