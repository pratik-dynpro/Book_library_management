# S-006 · Packet BRD — DELETE /books/{id}

**Module:** backend · **Risk:** L1 · **Depends on:** S-005

## ACs

| ID | Criterion |
|----|-----------|
| AC1 | `DELETE /books/{id}` returns 204 with empty body (TC-011 / US-04 AC1). |
| AC2 | Row is gone from `books` (TC-011 / US-04 AC2). |
| AC3 | Unknown id → 404 `{"detail":"Book not found"}` (TC-012 / US-04 AC3). |

## Do-Not-Break
S-002…S-005.

## Out-of-Scope
- Soft delete.
- Cascade to other tables (none in v1).
