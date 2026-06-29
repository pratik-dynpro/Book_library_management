# D7 · API Contracts

## 1. Base

- **Base URL (dev):** `http://localhost:8000`
- **Content-Type:** `application/json` (request + response)
- **Time format:** ISO 8601 UTC, e.g. `2026-06-23T14:05:32.000Z`
- **Error envelope:** `{ "detail": "<human-readable message>" }` — FastAPI default.

## 2. Resource Schemas

### `Book` (response)

```json
{
  "id": 1,
  "book_name": "Atomic Habits",
  "author": "James Clear",
  "genre": "Self Help",
  "status": "Read",
  "created_at": "2026-06-23T14:05:32.000Z"
}
```

### `BookCreate` (POST body)

```json
{
  "book_name": "Atomic Habits",
  "author": "James Clear",
  "genre": "Self Help",
  "status": "Read"
}
```

### `BookUpdate` (PUT body)

Identical to `BookCreate`. `extra='forbid'` (T-04). Partial updates not supported in v1 (no PATCH).

## 3. Endpoints

### 3.1 Create — `POST /books`

| | |
|---|---|
| Request | `BookCreate` |
| 201 Created | `Book` |
| 422 Unprocessable | `{ "detail": [ … FastAPI validation errors … ] }` |

### 3.2 List — `GET /books`

| Query param | Type | Meaning |
|-------------|------|---------|
| `search` | string | Case-insensitive substring match against `book_name` OR `author` |
| `author` | string | Exact case-insensitive match |
| `genre` | string | Exact case-insensitive match |
| `status` | enum `Read` / `Unread` | Exact match |

All filters compose with AND. Response: `Book[]`, capped at 1 000 rows (T-05). Ordered by `created_at DESC`.

### 3.3 Retrieve — `GET /books/{id}`

| | |
|---|---|
| 200 OK | `Book` |
| 404 Not Found | `{ "detail": "Book not found" }` |

### 3.4 Update — `PUT /books/{id}`

| | |
|---|---|
| Request | `BookUpdate` |
| 200 OK | `Book` |
| 404 Not Found | `{ "detail": "Book not found" }` |
| 422 Unprocessable | validation errors |

### 3.5 Delete — `DELETE /books/{id}`

| | |
|---|---|
| 204 No Content | _empty body_ |
| 404 Not Found | `{ "detail": "Book not found" }` |

## 4. Example `curl` Flow

```bash
# Create
curl -X POST localhost:8000/books \
  -H 'Content-Type: application/json' \
  -d '{"book_name":"Atomic Habits","author":"James Clear","genre":"Self Help","status":"Read"}'

# List with filter
curl 'localhost:8000/books?status=Unread&genre=Self%20Help'

# Search
curl 'localhost:8000/books?search=atomic'

# Update
curl -X PUT localhost:8000/books/1 \
  -H 'Content-Type: application/json' \
  -d '{"book_name":"Atomic Habits","author":"James Clear","genre":"Self Help","status":"Unread"}'

# Delete
curl -X DELETE localhost:8000/books/1 -i
```

## 5. OpenAPI

FastAPI auto-publishes the spec at `/openapi.json` and Swagger UI at `/docs`. The packet QA for S-002 must verify both URLs respond 200.

## 6. Versioning

Single, unversioned `v1` API in v1. If breaking changes are needed later, introduce `/v2/books` rather than mutating `/books`.

## 7. Backward-compatibility Rules (when iterating)

- **Add fields, never remove.** Clients ignore unknown fields.
- **Never narrow types.** `status` widening (e.g., to include `Reading`) is allowed; narrowing requires a major version.
- **Defaults preserve old behavior.** A new optional query param must default to "no effect".
