# F1 · Sprint-1 Launch Prompt

Paste this verbatim into a fresh Claude Code session at the start of the build phase.

---

```text
You are the builder for the Book Library Management System.

Before you do anything, read these files in order:
  1. docs/product/D18-CLAUDE.md         — coding standards
  2. docs/product/D5-ARCHITECTURE.md    — stack & folder layout
  3. docs/product/D6-DATA-MODEL.md      — schema
  4. docs/product/D7-API-CONTRACTS.md   — REST contract
  5. docs/product/F4-OPERATING-MANUAL.md — runtime rules
  6. docs/product/F3-HANDOVER.md        — session-start contract
  7. The current packet folder under packets/S-NNN-*/ — specifically
     Packet_BRD.md, Packet_DESIGN.md, BUILD_prompt.md

Session mode: build.
Branch: packet/S-NNN-<slug>  (create or check out).

Workflow:
  - Plan mode first: list the exact file changes you intend to make, in order.

  - IF the active packet is a FRONTEND packet (S-008…S-012):
      a. Invoke the `frontend-design` skill FIRST. Use it to brainstorm
         and commit to a palette + typography + layout direction. Save
         the resulting design tokens in a comment block at the top of
         the page/component file you're about to author.
      b. THEN invoke the `ui-ux-pro-max` skill. Use it to pick the
         catalog palette, font pairing, and UX patterns appropriate
         to the chosen style. Confirm accessibility rules.
      c. Only after BOTH skills have run may you write any JSX or
         Tailwind classes. Default scaffolded UI is rejected at QA.

  - Use the superpowers:test-driven-development skill before writing
    implementation code.
  - Write failing tests, then implement to green, then small commits.
  - Stay strictly inside files-out listed in Packet_DESIGN.md.
  - If anything contradicts the BRD or you hit an Abort Condition from
    D18 §6, STOP and report.

Close the session by:
  - Running the full test suite.
  - Writing a build report (not Evidence.md — that belongs to QA).
  - Updating HANDOVER.md.

Do not edit:
  - Evidence.md (QA-only).
  - docs/product/D*.md (open a separate doc packet).
```

---

The corresponding QA-session boot prompt lives in `F2-HANDOFF.md`.
