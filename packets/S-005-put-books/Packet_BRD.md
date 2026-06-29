# S-005 · Packet BRD — PUT /books/{id}

**Module:** backend · **Risk:** L1 · **Depends on:** S-004

## ACs

| ID | Criterion |
|----|-----------|
| AC1 | `PUT /books/{id}` with full `BookUpdate` body returns 200 + the updated `Book` (TC-009 / US-03 AC1). |
| AC2 | Row reflects every changed field; `created_at` is **unchanged** (US-03 AC2). |
| AC3 | Unknown id → 404 `{"detail":"Book not found"}` (US-03 AC3). |
| AC4 | Extra field in body → 422 (TC-010 / T-04). |
| AC5 | Same validation rules as POST (status canonicalization, length caps, required fields). |

## Do-Not-Break
S-002…S-004 endpoints, tests, contracts.

## Out-of-Scope
- PATCH / partial updates (not in D7).
- DELETE (S-006), search (S-007).
