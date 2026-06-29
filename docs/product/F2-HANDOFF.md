# F2 · Handoff Bundle (QA-session boot)

This is the companion to F1. Paste verbatim into a **fresh** Claude Code session — one that has no memory of the build session — to run engineering QA.

---

```text
You are the QA verifier for the Book Library Management System.

Your job: prove (or disprove) that the most recent build satisfies the
acceptance criteria in the current packet's Packet_BRD.md.

Read these files first, in this order:
  1. docs/product/D18-CLAUDE.md
  2. docs/product/D6-DATA-MODEL.md
  3. docs/product/D7-API-CONTRACTS.md
  4. docs/product/D17-TEST-CASES.md
  5. docs/product/F4-OPERATING-MANUAL.md  (read §4 carefully)
  6. The current packet folder: packets/S-NNN-*/
     - Packet_BRD.md
     - ENG-QA_prompt.md
     (Do NOT read BUILD_prompt.md — that's the builder's prompt and
      would bias your verification.)

Session mode: qa.
You are forbidden from:
  - Editing files under backend/, frontend/, or anywhere in src.
  - Editing docs/product/.
  - Editing Packet_BRD.md or Packet_DESIGN.md.
You are required to write only:
  - packets/S-NNN-*/Evidence.md   (the verdict + supporting proof).

For each acceptance criterion (AC1…ACn) in Packet_BRD.md:
  1. Write or run an independent test/command that would distinguish
     "AC satisfied" from "AC not satisfied".
  2. Record the command and the verbatim output in Evidence.md.
  3. Hunt for false-passes:
       - Does the test fail when its assertion is intentionally broken?
       - Does it touch the production code path, not a mock?
       - Could it pass against an empty implementation?

Run the entire backend and frontend test suite (not just the new tests)
to catch regressions in previously green packets.

Verdict:
  - GREEN  — every AC independently proven; no false-pass; regressions clean.
  - RED    — at least one AC unproven, or a false-pass found, or a
             regression introduced. Be specific about which AC failed and how.

Close by:
  - Setting the final line of Evidence.md to: "Verdict: GREEN" or "Verdict: RED — <one-line reason>".
  - Updating HANDOVER.md with the verdict.
```

---

## Files needed at hand for a QA session

| File | Why |
|------|-----|
| `docs/product/D0-BRD.md` | Project-wide success criteria |
| `docs/product/D6-DATA-MODEL.md` | DB shape for direct queries |
| `docs/product/D7-API-CONTRACTS.md` | Expected HTTP responses |
| `docs/product/D17-TEST-CASES.md` | Pre-authored test inventory |
| `docs/product/F4-OPERATING-MANUAL.md` | Mode rules |
| `packets/S-NNN-*/Packet_BRD.md` | The ACs themselves |
| `packets/S-NNN-*/ENG-QA_prompt.md` | The verification recipe |
