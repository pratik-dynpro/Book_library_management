# D17 · Test Cases

Each case cites the AC it proves (from D15b) and the packet that owns it.

## Functional / API

| TC | Description | Proves | Owner packet |
|----|-------------|--------|--------------|
| TC-001 | POST /books with valid body → 201 + Book | US-01 AC1 | S-003 |
| TC-002 | POST /books missing book_name → 422 | US-01 AC3 | S-003 |
| TC-003 | POST /books status='Reading' → 422 | US-01 AC4 | S-003 |
| TC-004 | POST /books status='read' (lowercase) → 201, persisted as 'Read' | US-01 AC4, OQ-006 | S-003 |
| TC-005 | GET /books with no rows → 200 `[]` | US-02 AC2 | S-004 |
| TC-006 | GET /books ordering = created_at DESC | US-02 AC1 | S-004 |
| TC-007 | GET /books with 1 001 inserted rows → returns 1 000 | US-02 AC3, T-05 | S-004 |
| TC-008 | GET /books/{id} unknown → 404 | US-03 AC3 | S-004 |
| TC-009 | PUT /books/{id} valid → 200, row updated, created_at unchanged | US-03 AC1, AC2 | S-005 |
| TC-010 | PUT /books/{id} with extra field → 422 | US-03 AC4 | S-005 |
| TC-011 | DELETE /books/{id} → 204, row gone | US-04 AC1, AC2 | S-006 |
| TC-012 | DELETE unknown id → 404 | US-04 AC3 | S-006 |

## Search / Filter

| TC | Description | Proves | Owner packet |
|----|-------------|--------|--------------|
| TC-020 | GET /books?search=atomic matches book_name substring case-insensitively | US-05 AC1 | S-007 |
| TC-021 | GET /books?search=clear matches author substring | US-05 AC1 | S-007 |
| TC-022 | GET /books?search= empty → behaves as no filter | US-05 AC2 | S-007 |
| TC-023 | SQLi probe in ?search= returns 0 rows; table intact | US-05 AC3, T-01 | S-007 |
| TC-024 | ?author=James%20Clear filters exact case-insensitive | US-06 AC1 | S-007 |
| TC-025 | ?genre=Self%20Help filters exact case-insensitive | US-07 AC1 | S-007 |
| TC-026 | ?status=Read returns only Read rows | US-08 AC1 | S-007 |
| TC-027 | ?status=foo → 422 | US-08 AC2 | S-007 |
| TC-028 | Combined ?author=&genre=&status= composes with AND | US-06/07/08 | S-007 |

## DB-level

| TC | Description | Proves | Owner packet |
|----|-------------|--------|--------------|
| TC-040 | INSERT with status='Maybe' raises CheckConstraint | D6 §2 | S-001 |
| TC-041 | created_at defaults to NOW if not provided | D6 §5 | S-001 |
| TC-042 | Indexes idx_books_author/genre/status exist after migration | D6 §2 | S-001 |

## Integration / E2E (frontend)

| TC | Description | Proves | Owner packet |
|----|-------------|--------|--------------|
| TC-060 | Add → list → see new card | US-01, US-02 | S-010 |
| TC-061 | Edit → list → see updated values | US-03 | S-011 |
| TC-062 | Delete → modal confirm → card disappears | US-04 | S-009 |
| TC-063 | Search box filters live as user types | US-05 | S-012 |
| TC-064 | Filter dropdowns compose | US-06/07/08 | S-012 |
| TC-065 | Home stats reflect DB after CRUD | US-09 | S-008 |
| TC-066 | All pages render at 360 px width without horizontal scroll | US-11, Q-003 | S-009 |
| TC-067 | Empty book_name shows inline error | US-12 AC1 | S-010 |

## Security / NFR

| TC | Description | Proves | Owner packet |
|----|-------------|--------|--------------|
| TC-080 | CORS preflight from disallowed origin → 400/403 | T-07 | S-002 |
| TC-081 | `<script>` in book_name renders as literal text, not script | T-02 | S-009 |
| TC-082 | 300-char book_name → 422 | T-06 | S-003 |
| TC-083 | GET /books with 1 000 rows → median latency < 50 ms | Q-005 | S-007 |
| TC-084 | List render < 300 ms with 1 000 rows | Q-001 | S-009 |
| TC-085 | ruff check → exit 0; eslint → exit 0 | Q-007 | S-002, S-009 |
