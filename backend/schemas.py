"""Pydantic v2 schemas for the Book resource."""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class BookBase(BaseModel):
    book_name: str = Field(min_length=1, max_length=255)
    author: str = Field(min_length=1, max_length=255)
    genre: str = Field(min_length=1, max_length=100)
    status: Literal["Read", "Unread"]

    model_config = ConfigDict(extra="forbid")

    @field_validator("book_name", "author", "genre", mode="before")
    @classmethod
    def _strip(cls, v: object) -> object:
        return v.strip() if isinstance(v, str) else v

    @field_validator("status", mode="before")
    @classmethod
    def _canon_status(cls, v: object) -> object:
        if isinstance(v, str):
            cleaned = v.strip().capitalize()
            return cleaned
        return v


class BookCreate(BookBase):
    pass


class BookUpdate(BookBase):
    pass


class Book(BookBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(extra="forbid", from_attributes=True)
