# F4 · Operating Manual — Runtime Rules for Claude Code

These rules apply to **every** Claude Code session inside this repo. They are enforced by the hooks in `D4-ENFORCEMENT.md` where automatable, and by convention otherwise.

## 1. Session Start Checklist

Before any tool call:

1. Read `docs/product/D18-CLAUDE.md` (coding standards).
2. Read the current `packets/S-NNN-*/Packet_BRD.md` and `Packet_DESIGN.md`.
3. Read `OQ-OPEN-QUESTIONS.md` — if any **Blocker** affects the current packet, stop and report.
4. Confirm the branch is `packet/S-NNN-slug` and current.

## 2. Session Modes

| Mode | Env var | What's allowed |
|------|---------|----------------|
| `build` | `CLAUDE_SESSION=build` (default) | Edit code + tests + product code listed in `files-out`; commit; cannot edit `Evidence.md`. |
| `qa` | `CLAUDE_SESSION=qa` | Read-only on product code; write `Evidence.md`; run tests; cannot edit `Packet_BRD.md` or `Packet_DESIGN.md`. |

The session opens by stating which mode it's in. Hooks block out-of-mode edits.

## 3. Build Sessions

- TDD order is **non-negotiable**: failing test → green → refactor.
- Each commit message states the AC(s) it advances, e.g. `S-003 AC1: POST /books returns 201`.
- At end of session: emit a build report listing files-out diff vs. plan, tests run, ACs claimed satisfied.

## 4. QA Sessions

- Start with zero memory of the build session. Re-derive expectations from `Packet_BRD.md` only.
- Run the full backend + frontend test suite, not just the new tests.
- Hunt false-passes using the template in the packet's `ENG-QA_prompt.md`.
- Emit the verdict: `GREEN` only when every AC is independently proven; otherwise `RED` with specific failure pointers.

## 5. Bounce Procedure (red gate)

1. QA's `Evidence.md` records `RED` with reproducible details.
2. The packet branch returns to **build** mode for a fix-cycle.
3. After fix: a new `ENG-QA_prompt.md` run in a fresh session re-verifies.
4. Loop until `GREEN`; no time pressure overrides this.

## 6. Forbidden Without Explicit User Approval

- `git push --force` to any branch with a PR.
- `git reset --hard` past the last green packet commit.
- Editing `docs/product/D*.md` mid-packet (open a doc-update packet instead).
- Adding a dependency not declared in `D5-ARCHITECTURE.md` §1 stack table.

## 7. End-of-Session Hand-back

Every session closes with a one-paragraph summary: what was done, what's next, any open questions added to `OQ-OPEN-QUESTIONS.md`. The next session reads it as the first line of context.
