"""S-007 ACs — search + filter query params on GET /books."""

from __future__ import annotations

import time
from datetime import UTC, datetime, timedelta
from statistics import median

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.models import Book


def _book(book_name: str, author: str, genre: str, status: str, ts: datetime) -> Book:
    return Book(
        book_name=book_name,
        author=author,
        genre=genre,
        status=status,
        created_at=ts,
    )


@pytest.fixture()
def seeded(db_session: Session) -> None:
    """Five known rows spanning the filter dimensions."""
    base = datetime(2026, 1, 1, tzinfo=UTC)
    db_session.add_all([
        _book("Atomic Habits",       "James Clear",   "Self Help", "Read",   base),
        _book("Deep Work",            "Cal Newport",   "Self Help", "Unread", base + timedelta(hours=1)),
        _book("The Atomic Café",      "Jane Doe",      "History",   "Read",   base + timedelta(hours=2)),
        _book("Show Your Work!",      "Austin Kleon",  "Art",       "Read",   base + timedelta(hours=3)),
        _book("So Good They Can't Ignore You", "Cal Newport", "Career", "Unread", base + timedelta(hours=4)),
    ])
    db_session.flush()


def _titles(payload: list[dict]) -> list[str]:
    return [b["book_name"] for b in payload]


# ---------- AC1 — search ----------

def test_search_matches_title_substring_case_insensitive(client: TestClient, seeded: None) -> None:
    r = client.get("/books", params={"search": "atomic"})
    assert r.status_code == 200
    titles = _titles(r.json())
    assert "Atomic Habits" in titles and "The Atomic Café" in titles
    assert len(titles) == 2

    # Uppercase form must match the same rows
    r2 = client.get("/books", params={"search": "ATOMIC"})
    assert _titles(r2.json()) == titles


def test_search_matches_author_substring(client: TestClient, seeded: None) -> None:
    r = client.get("/books", params={"search": "newport"})
    assert r.status_code == 200
    titles = set(_titles(r.json()))
    assert titles == {"Deep Work", "So Good They Can't Ignore You"}


# ---------- AC2 — empty search ----------

def test_search_empty_returns_all(client: TestClient, seeded: None) -> None:
    r = client.get("/books", params={"search": ""})
    assert r.status_code == 200
    assert len(r.json()) == 5


# ---------- AC3 — SQLi safety ----------

def test_sql_injection_probe_safe(client: TestClient, seeded: None, db_session: Session) -> None:
    """A classic injection string must return safely; table must still exist."""
    r = client.get("/books", params={"search": "'; DROP TABLE books;--"})
    assert r.status_code == 200
    assert r.json() == []

    # Confirm books still exists and has the seeded rows
    count = db_session.execute(text("SELECT COUNT(*) FROM books")).scalar_one()
    assert count == 5


# ---------- AC4 / AC5 — author + genre filters ----------

def test_filter_by_author_case_insensitive(client: TestClient, seeded: None) -> None:
    r = client.get("/books", params={"author": "james clear"})
    assert r.status_code == 200
    titles = _titles(r.json())
    assert titles == ["Atomic Habits"]


def test_filter_by_genre_case_insensitive(client: TestClient, seeded: None) -> None:
    r = client.get("/books", params={"genre": "SELF HELP"})
    assert r.status_code == 200
    titles = set(_titles(r.json()))
    assert titles == {"Atomic Habits", "Deep Work"}


# ---------- AC6 / AC7 — status ----------

def test_filter_by_status(client: TestClient, seeded: None) -> None:
    r = client.get("/books", params={"status": "Read"})
    assert r.status_code == 200
    for b in r.json():
        assert b["status"] == "Read"
    assert len(r.json()) == 3


def test_invalid_status_returns_422(client: TestClient, seeded: None) -> None:
    r = client.get("/books", params={"status": "foo"})
    assert r.status_code == 422


# ---------- AC8 — composition ----------

def test_combined_filters_compose_AND(client: TestClient, seeded: None) -> None:
    r = client.get(
        "/books",
        params={"author": "Cal Newport", "status": "Unread"},
    )
    assert r.status_code == 200
    titles = set(_titles(r.json()))
    assert titles == {"Deep Work", "So Good They Can't Ignore You"}

    # And-combined with search: 'newport' AND status=Read should be empty.
    r2 = client.get("/books", params={"search": "newport", "status": "Read"})
    assert r2.status_code == 200
    assert r2.json() == []


# ---------- AC9 — perf NFR Q-005 ----------

def test_perf_median_under_50ms(client: TestClient, db_session: Session) -> None:
    """Median GET /books latency < 50 ms with 1000 rows in the table."""
    base = datetime(2026, 2, 1, tzinfo=UTC)
    db_session.add_all([
        _book(f"Title {i:04d}", f"Author {i % 50}", "Fiction", "Read" if i % 2 else "Unread",
              base + timedelta(seconds=i))
        for i in range(1000)
    ])
    db_session.flush()

    # Warm-up
    client.get("/books").raise_for_status()

    samples = []
    for _ in range(20):
        t0 = time.perf_counter()
        r = client.get("/books")
        samples.append((time.perf_counter() - t0) * 1000.0)
        r.raise_for_status()

    med = median(samples)
    # Record for evidence
    print(f"\nperf samples (ms): median={med:.1f}  min={min(samples):.1f}  max={max(samples):.1f}")
    assert med < 50.0, f"median {med:.1f} ms exceeds NFR Q-005 threshold of 50 ms"
