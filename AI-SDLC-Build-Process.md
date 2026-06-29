# AI-SDLC Build Process

**A reusable build chain for full-stack projects with Claude Code**
*product → module → feature → packet*

> A generic, project-agnostic flow. The 21 planning documents define the **whole product**; the product decomposes into **modules**, modules into **features**, and every feature is built as one or more **work-packets** — each a disciplined 5-file cycle that ends only when QA evidence closes green.
>
> **Promise: Move fast, leave proof.**

---

## The Decomposition — How Scope Nests

Scope nests top-to-bottom. Each level is a smaller, more concrete slice of the one above it.

```
PRODUCT   →  21 planning docs        defines the entire system once
  └─ MODULE   →  frontend · backend · database · infra      major architectural areas
       └─ FEATURE   →  login · signup · landing · API routes      shippable units inside a module
            └─ PACKET   →  5 files · one tightly-scoped change      the atomic unit of execution
```

| Level | Example | Role |
|-------|---------|------|
| **Product** | the whole system | defined once by 21 planning docs |
| **Module** | frontend, backend, database, infra | major architectural areas |
| **Feature** | login, signup, landing page, API routes | shippable units inside a module |
| **Packet** | one form, one endpoint, one table | the atomic unit of execution (5 files) |

### Legend

- **Files (per packet):** `Packet_BRD.md` · `Packet_DESIGN.md` · `BUILD_prompt.md` · `ENG-QA_prompt.md` · `Evidence.md`
- **Roles:** Builder · QA · DevOps · PM · Sec
- **★** = minimal subset for small projects · **⟳** = repeat per packet

---

## Stage 1 · Product — Plan the Whole System Once

**Owners:** Builder · PM · Doc-QA

Authored before any code. Each document is reviewed by a paired QA pass (**PASS · CONDITIONAL · FAIL**). Documents flow downstream — later docs read earlier ones. You scale this down for small projects: a minimal build needs only the starred essentials (★).

### Pre-phase · Discovery

| ID | Document | Purpose |
|----|----------|---------|
| **D0 ★** | BRD | Business requirements; the whole-product WHAT |
| OQ | Open-Questions | Live tracker; blockers halt downstream work |

### Phase A · Foundations

| ID | Document | Purpose |
|----|----------|---------|
| D1 | ROADMAP | Milestones & delivery drops |
| **D2 ★** | PRD | Personas, journeys, capabilities |
| D15a | USER-STORIES v1 | Business-language stories |
| **D5 ★** | ARCHITECTURE | Stack, components, data flow |
| D5b | AI-READINESS | Dispositions & scorecard |

### Phase B · Decomposition

| ID | Document | Purpose |
|----|----------|---------|
| **D3 ★** | FEATURE-CATALOG | F-NNN features + module boundaries |
| D10 | QUALITY (NFRs) | Q-NNN non-functional thresholds |
| **D12 ★** | SECURITY | Auth, RBAC, threat model |

### Phase C · Detailed Design

| ID | Document | Purpose |
|----|----------|---------|
| **D6 ★** | DATA-MODEL | Schema, DDL, ERD, state machines |
| **D7 ★** | API-CONTRACTS | OpenAPI, error schema, headers |
| D15b | USER-STORIES v2 | Build-precise AC + table.column |
| D17 | TEST-CASES | Functional/DB/API/integration cases |

### Phase D · Build-facing

| ID | Document | Purpose |
|----|----------|---------|
| **D18 ★** | CLAUDE.md | Coding standards + conventions rulebook |
| **D8 ★** | BACKLOG | S-NNN stories → each becomes a packet |
| D4 | ENFORCEMENT | `.claude/` rules, skills, hooks, gates |
| D9 | DESIGN-SPEC | Screen specs by drop, field-level |

### Phase E · Operations & Resilience

| ID | Document | Purpose |
|----|----------|---------|
| D13 | INFRA | Deployment, environments, CI/CD, cost |
| D14 | MIGRATION | Cutover runbook, source→target |
| D11 | TESTING | Strategy, pipeline, regression |
| D16 | FAULT-TOLERANCE | Failure scenarios, recovery |

### Phase F · Runtime Contracts

| ID | Document | Purpose |
|----|----------|---------|
| F4 | OPERATING-MANUAL | Rules Claude Code obeys at runtime |
| F3 | HANDOVER | Runtime contract for session start |
| F1 / F2 | LAUNCH + HANDOFF | Sprint-1 boot prompt + bundle |

> **Minimal starter set (★):** BRD → PRD → ARCHITECTURE → FEATURE-CATALOG → SECURITY → DATA-MODEL → API-CONTRACTS → CLAUDE.md → BACKLOG. Add the rest only where they earn their keep.

---

## Stage 2 · Decompose — Product → Module → Feature → Packet

**Owners:** PM · Builder

The FEATURE-CATALOG (D3) and BACKLOG (D8) drive this split. Every leaf — a single packet — maps to exactly one backlog story.

```
▼ PRODUCT   (21 planning docs define this whole tree)
│
├─ ■ MODULE: frontend
│    ├─ ◆ feature: landing page
│    │     └─ ⬡ packet: hero + nav                 → [ 5 files ]
│    │     └─ ⬡ packet: featured-listings grid     → [ 5 files ]
│    ├─ ◆ feature: login
│    │     └─ ⬡ packet: login form + validation    → [ 5 files ]
│    └─ ◆ feature: signup
│          └─ ⬡ packet: signup form + email verify → [ 5 files ]
│
├─ ■ MODULE: backend
│    ├─ ◆ feature: API routes
│    │     └─ ⬡ packet: POST /auth/login           → [ 5 files ]
│    │     └─ ⬡ packet: POST /auth/signup          → [ 5 files ]
│    └─ ◆ feature: auth service
│          └─ ⬡ packet: JWT issue + refresh        → [ 5 files ]
│
├─ ■ MODULE: database
│    └─ ◆ feature: user schema
│          └─ ⬡ packet: users + sessions tables    → [ 5 files ]
│
└─ ■ MODULE: infra
     └─ ◆ feature: CI/CD + deploy
           └─ ⬡ packet: pipeline + preview env     → [ 5 files ]
```

> **Rule of thumb (PM):** a packet = one bug fix OR one tightly-scoped feature slice. If it touches more than a handful of files or crosses module boundaries, split it.

---

## Stage 3 · Build — The Work-Packet (5-File Cycle)

This is the engine of the whole framework. It repeats once per packet, for every leaf in the tree above.

> **⟳ Repeat this entire 5-file cycle for every packet** — authored, executed, QA'd, evidenced, in order.

Files 1–4 are authored up front (the contract + prompts). File 5 is produced *after* QA runs against the executed build.

```
  ① Packet_BRD.md          (the WHAT)
        ↓
  ② Packet_DESIGN.md       (the HOW)
        ↓
  ③ BUILD_prompt.md        (instructions to Claude)
        ↓
  ⌗ EXECUTION              (Claude Code runs the build → product code)
        ↓
  ④ ENG-QA_prompt.md       (fresh session verifies — runs AFTER execution)
        ↓
  ⑤ Evidence.md            (proof packet — generated AFTER QA)
        ↓
  🟢 GATE → green only when Evidence + QA report both close
        ↺ defects bounce back to ③ (re-build) — never merge red
```

### ① `Packet_BRD.md` — the WHAT  *(Builder)*

Defines what this packet must achieve — **before any design or code**.

- **Binary acceptance criteria** — each AC is testable, pass/fail, no ambiguity
- **Do-Not-Break list** — existing behavior that must keep working
- **Out-of-scope** — explicitly what this packet will NOT touch
- **Risk class (L0–L3)** — sets how much rigor the rest of the cycle needs

### ② `Packet_DESIGN.md` — the HOW  *(Builder + architect review)*

Translates the BRD into a concrete technical plan.

- **Files in / files out** — the exact blast radius of the change
- **AC-to-code map** — which file/function satisfies which acceptance criterion
- **Rollback plan** — how to undo cleanly if it fails
- **Alternatives considered** — and why this approach won

### ③ `BUILD_prompt.md` — instructions to Claude  *(Builder)*

The personalized prompt you paste into Claude Code to do the work.

- **Goal & scope** — restates the packet's intent and names the in-scope files
- **Constraints** — coding standards (from CLAUDE.md), patterns to reuse
- **Abort conditions** — when Claude should stop and report rather than guess
- **Build approach** — TDD: failing tests first → implement to green → small commits

### ⌗ Execution — Claude Code runs the BUILD prompt  *(Builder)*

**Session #1:** plan mode → write failing tests → implement to green → run affected tests → small commits → self-verify → close with a build report. **Hooks** auto-format, block dangerous ops, and may run the suite on stop. *This is where the actual product code is produced.*

### ④ `ENG-QA_prompt.md` — runs AFTER execution  *(QA · engineer)*

A **fresh Claude Code session with zero memory of the build** verifies the output against the BRD.

- **AC-to-proof mapping** — every acceptance criterion gets an independent test
- **False-pass anti-patterns** — hunts for tests that pass without proving anything
- **Meta-checks** — confirms no production code was edited during QA
- **Verdict** — emits a QA report; any false-pass or meta-fail ≠ green

### ⑤ `Evidence.md` — generated after QA  *(QA · DevOps)*

The proof packet — assembled once QA has reviewed the build output.

- **Raw diff** — exactly what changed
- **Commands & outputs** — test runs, lint, type-check, CI logs
- **QA verification report** — the verdict and supporting proof
- **Deviations & rollback** — anything that diverged from DESIGN, and the undo path

### 🟢 Packet Gate

**Green only when Evidence + QA report both close.** If any AC fails or QA finds a false-pass → bounce back, fix, and re-run the cycle from file ③. **Never merge a red packet.**

---

## Stage 4 · Roll-up — Assemble Packets Upward

**Owners:** QA · DevOps

Green packets integrate upward. Each level adds its own integration QA before merging into the next.

```
closed packet → feature integration QA → module integration QA → product integration
```

Continuous delivery practices (trunk-based, build-once-promote, feature flags, preview envs) run from the very first green packet.

> **Merge rule (DevOps):** trunk-based; merge a packet only when its gate is green and CI passes all layers — **lint → type → security → regression → E2E**.

---

## Reference · Who Owns Each File

| File | Primary owner | When it's created | What makes it "done" |
|------|---------------|-------------------|----------------------|
| `Packet_BRD.md` | Builder / BA | Before anything else | Every AC is binary & testable; scope boundaries explicit |
| `Packet_DESIGN.md` | Builder + architect review | After BRD signed | Files-in/out named; each AC mapped to code; rollback defined |
| `BUILD_prompt.md` | Builder | After DESIGN signed | Goal, scope, constraints, abort conditions all stated |
| `ENG-QA_prompt.md` | QA (fresh session) | After build executes | Independent tests per AC; false-pass hunt complete |
| `Evidence.md` | QA + DevOps | After QA verdict | Diff, outputs, report, deviations & rollback all attached |

---

## Principles — What Keeps It Disciplined

- **WHAT before HOW** — BRD before DESIGN before code
- **Fresh-eyes QA** — verifier has zero build memory
- **Evidence over claims** — prove it, don't assert it
- **Scope lock** — out-of-scope work → a new packet
- **Binary AC** — pass/fail, never "looks right"
- **TDD** — failing tests first
- **Small commits** — trunk-based hygiene
- **Risk sets rigor** — L0 light, L3 heavy
- **Bounce on defect** — never merge red
- **Scale to fit** — small projects use the ★ subset

---

*AI-SDLC · generic build process · product → module → feature → packet*
*★ minimal subset · ⟳ repeat per packet · Move fast, leave proof.*
