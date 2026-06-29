"""baseline: books table + CHECK + 4 indexes per D6-DATA-MODEL.md

Revision ID: 0001
Revises:
Create Date: 2026-06-23
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "books",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("book_name", sa.String(length=255), nullable=False),
        sa.Column("author", sa.String(length=255), nullable=False),
        sa.Column("genre", sa.String(length=100), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.CheckConstraint("status IN ('Read', 'Unread')", name="ck_books_status"),
    )

    # Functional case-insensitive indexes for search / filter dimensions
    op.execute("CREATE INDEX idx_books_author       ON books (LOWER(author))")
    op.execute("CREATE INDEX idx_books_genre        ON books (LOWER(genre))")
    op.execute("CREATE INDEX idx_books_book_name_ci ON books (LOWER(book_name))")
    op.create_index("idx_books_status", "books", ["status"])


def downgrade() -> None:
    op.drop_index("idx_books_status", table_name="books")
    op.execute("DROP INDEX IF EXISTS idx_books_book_name_ci")
    op.execute("DROP INDEX IF EXISTS idx_books_genre")
    op.execute("DROP INDEX IF EXISTS idx_books_author")
    op.drop_table("books")
