"""Load and query the catalog of comparable rich political novels."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass
class ReferenceBook:
    id: str
    title: str
    author: str
    year: int
    themes: list[str]
    structural_devices: list[str]
    comparable_to_prs: list[str]
    act_structure: str
    length_words: int
    notes: str = ""

    def to_dict(self) -> dict[str, Any]:
        return self.__dict__.copy()


def load_references(path: Path | str) -> list[ReferenceBook]:
    """Load reference books from JSON catalog."""
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    return [ReferenceBook(**entry) for entry in data]
