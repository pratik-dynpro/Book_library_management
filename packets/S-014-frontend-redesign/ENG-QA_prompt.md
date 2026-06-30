# Packet S-014 — ENG-QA prompt

> **Paste this into a fresh QA session (or the same session as the build, for self-QA).**
> **Read first:** `Packet_BRD.md` (ACs), `Packet_DESIGN.md` (file map), then this file.

---

## Self-QA disclosure

Because this project runs build and QA in the same session (single developer), this packet's verification is a **self-QA pass** — the same approach used in S-001 through S-013. Mitigations baked into the recipe:

- Re-derive expectations from the BRD **before** running anything. Do not skim the build output.
- Run every command verbatim from `BUILD_prompt.md` Task 10, separately, capturing output.
- Diff every changed file against `git show HEAD` to confirm only the listed files moved.
- Open the running app in a browser and visually compare against the design spec's stated outcomes (no design language outside spec → flag).

If anything below fails, the verdict is RED. Half-passes are not allowed.

---

## QA checklist (one row per AC)

| AC    | What to run / check                                                                                                                                                                                                                                                                          | Pass criterion                                                                                                                                                            |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1  | `Select-String -Path frontend/index.html -Pattern "Tinos\|Poppins\|Newsreader\|DM\+Sans"`                                                                                                                                                                                                       | Matches for `Tinos` and `Poppins` only. No `Newsreader`, no `DM+Sans`.                                                                                                     |
| AC-2  | Read `frontend/src/design/tokens.js`; `Select-String -Path frontend/src -Pattern "spineColor\|binding\|gilt\|moss" -Recurse`                                                                                                                                                                  | tokens.js exports exactly the 11 keys listed in BRD AC-2; no `spineColor` / `binding` / `gilt` / `moss` anywhere in `frontend/src`.                                       |
| AC-3  | Read lines for `type` in `tokens.js`.                                                                                                                                                                                                                                                          | Display family `"Tinos", "Times New Roman", serif`; body family `"Poppins", system-ui, -apple-system, "Segoe UI", sans-serif`.                                              |
| AC-4  | Read the `colors` block in `tailwind.config.js`.                                                                                                                                                                                                                                                 | `accent` is nested (DEFAULT/hover/soft); `warning` is present; `binding`/`gilt`/`moss` are gone.                                                                          |
| AC-5  | `Select-String -Path frontend/src/index.css -Pattern "binding\|gilt\|moss\|\.shelf\|\.spine\|\.empty-shelf\|ghost-spine"`                                                                                                                                                                       | No matches. Focus-ring + selection rules reference `accent`/`ink` (open file and verify).                                                                                  |
| AC-6  | Read `frontend/src/components/BookCard.jsx`.                                                                                                                                                                                                                                                    | Single file ≤ 60 lines; no `StatusBadge`; no `spineColorFor` import; contains `border-l-2`, `border-l-accent`, `border-l-hairline`, `<span className="sr-only">`.            |
| AC-7  | Read `frontend/src/pages/Home.jsx`; `Select-String -Path frontend/src/pages/Home.jsx -Pattern "Spine\|EmptyShelf\|StatCard\|spineColorFor\|Library card\|By the numbers"`                                                                                                                       | All grep patterns return no matches. File defines exactly one inline sub-component (`StatsBlock`) and `Home` itself.                                                       |
| AC-8  | Read the `StatsBlock` implementation.                                                                                                                                                                                                                                                            | Bar width formula present (`Math.max(8, (count / maxCount) * 100)`). `.slice(0, 6)` cap with `+ N more` overflow row. Empty-state copy exactly matches BRD AC-8 string.    |
| AC-9  | `cd frontend; npm test -- --run; cd ..`                                                                                                                                                                                                                                                          | Final line shows `Tests  35 passed (35)`. Only `Home.test.jsx` appears in `git status` among `*.test.jsx` files.                                                            |
| AC-10 | `cd frontend; npm run lint; cd ..`                                                                                                                                                                                                                                                               | Exits 0; no warnings (eslint runs with `--max-warnings 0`).                                                                                                                |
| AC-11 | `cd frontend; npm run build; cd ..`                                                                                                                                                                                                                                                              | Exits 0; printed gzipped JS size within ±10 KB of 80.74 KB (so 70.74–90.74 KB inclusive).                                                                                  |
| AC-12 | `Select-String -Path frontend/src -Pattern "#[0-9a-fA-F]{3,8}" -Include "*.jsx" -Recurse`                                                                                                                                                                                                       | No matches.                                                                                                                                                                |
| AC-13 | Manual: start backend + frontend, open `http://localhost:5173`, attach screenshot.                                                                                                                                                                                                              | Hero renders Tinos 700; stats block + bar chart visible; `/books` shows 2-px indigo left border on Read cards; `/add` form focus ring + primary button indigo; 360 px no horizontal scroll. |

---

## Verdict template (paste into `Evidence.md`)

```markdown
# S-014 — Evidence

**Verdict:** GREEN | RED  ← pick one
**Build session:** 2026-06-30 (self-QA)
**Tested against:** working tree at commit `<sha>` (or HEAD if uncommitted)

## ACs

| # | Status | Notes |
|---|--------|-------|
| AC-1  | Pass / Fail | <output excerpt> |
| AC-2  | Pass / Fail | <output excerpt> |
| AC-3  | Pass / Fail | <output excerpt> |
| AC-4  | Pass / Fail | <output excerpt> |
| AC-5  | Pass / Fail | <output excerpt> |
| AC-6  | Pass / Fail | <output excerpt> |
| AC-7  | Pass / Fail | <output excerpt> |
| AC-8  | Pass / Fail | <output excerpt> |
| AC-9  | Pass / Fail | "Tests  35 passed (35)" |
| AC-10 | Pass / Fail | exit code; output |
| AC-11 | Pass / Fail | gzip JS size: NN.NN KB |
| AC-12 | Pass / Fail | grep output |
| AC-13 | Pass / Fail | screenshot path or description |

## Self-QA disclosure

This packet was QA-ed by the same session that built it. Mitigation: each AC was re-derived from BRD without re-reading build output, then verified by the grep / command listed in `ENG-QA_prompt.md`.

## Deferrals

- (none, or list)

## Tracker

- [ ] CLAUDE.md §5 packet table updated for S-014.
- [ ] `Project_Progress_Tracker.xlsx` row 18 marked Done (or noted as needing manual update).
```

---

**End of ENG-QA prompt.**
