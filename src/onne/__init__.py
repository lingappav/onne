"""The President's Rule — research & analysis toolkit."""

__version__ = "0.1.0"

from .parser import Chapter, parse_master_narrative
from .analysis import beat_signature, compare_to_reference
from .references import load_references, ReferenceBook

__all__ = [
    "Chapter",
    "parse_master_narrative",
    "beat_signature",
    "compare_to_reference",
    "load_references",
    "ReferenceBook",
]
