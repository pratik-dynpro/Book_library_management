"""Test fixtures per docs/product/D11-TESTING.md §2 — Postgres-backed, transaction-per-test."""

from __future__ import annotations

import os
import subprocess
import sys
from collections.abc import Generator
from pathlib import Path

import pytest
from dotenv import load_dotenv
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / "backend" / ".env")

TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL")
if not TEST_DATABASE_URL:
    raise RuntimeError("TEST_DATABASE_URL is not set (see backend/.env.example)")


@pytest.fixture(scope="session")
def engine() -> Generator[Engine, None, None]:
    eng = create_engine(TEST_DATABASE_URL, future=True)
    yield eng
    eng.dispose()


@pytest.fixture(scope="session", autouse=True)
def apply_migrations(engine: Engine) -> None:
    """Reset schema via Alembic at the start of the test session."""
    env = {**os.environ, "DATABASE_URL": TEST_DATABASE_URL}
    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS books CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS alembic_version CASCADE"))
    subprocess.run(
        [
            sys.executable, "-m", "alembic",
            "-c", str(ROOT / "backend" / "alembic.ini"),
            "upgrade", "head",
        ],
        check=True,
        env=env,
        cwd=ROOT,
    )


@pytest.fixture()
def db_session(engine: Engine) -> Generator[Session, None, None]:
    """Function-scoped session bound to a SAVEPOINT, rolled back at teardown."""
    connection = engine.connect()
    transaction = connection.begin()
    Session_ = sessionmaker(bind=connection, autoflush=False, autocommit=False, future=True)
    session = Session_()
    nested = connection.begin_nested()

    @event.listens_for(session, "after_transaction_end")
    def _restart_savepoint(sess: Session, trans) -> None:
        nonlocal nested
        if trans.nested and not trans._parent.nested:
            nested = connection.begin_nested()

    try:
        yield session
    finally:
        session.close()
        if transaction.is_active:
            transaction.rollback()
        connection.close()


@pytest.fixture()
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """TestClient with get_db overridden to use the per-test session."""
    from backend.database import get_db
    from backend.main import app

    def _override() -> Generator[Session, None, None]:
        yield db_session

    app.dependency_overrides[get_db] = _override
    try:
        with TestClient(app) as c:
            yield c
    finally:
        app.dependency_overrides.pop(get_db, None)
