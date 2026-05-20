#!/usr/bin/env python3
"""Parse The_Presidents_Rule_Master_Narrative.md → data/beats.json.

Run from the repo root:
    python3 scripts/extract_beats.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "src"))

from onne.parser import parse_master_narrative  # noqa: E402
from onne.analysis import beat_signature, classify_beat  # noqa: E402


MASTER_NARRATIVE = ROOT / "manuscripts" / "The_Presidents_Rule_Master_Narrative.md"
OUTPUT = ROOT / "data" / "beats.json"


def main() -> int:
    if not MASTER_NARRATIVE.exists():
        print(f"ERROR: {MASTER_NARRATIVE} not found.", file=sys.stderr)
        return 1

    print(f"Parsing {MASTER_NARRATIVE.name}...")
    chapters = parse_master_narrative(MASTER_NARRATIVE)
    print(f"  Found {len(chapters)} chapters/epilogue.")

    chapter_records = []
    for ch in chapters:
        rec = ch.to_dict()
        # Strip the heavy body for the JSON output — keep only structured fields
        rec["body_preview"] = rec.pop("body")[:400].strip()
        rec["beat_tags"] = classify_beat(ch)
        chapter_records.append(rec)

    signature = beat_signature(chapters)
    # Counter isn't directly JSON-serialisable — convert
    signature["act_distribution"] = dict(signature["act_distribution"])

    output = {
        "source": MASTER_NARRATIVE.name,
        "novel": "The President's Rule",
        "author": "Shambhulingappa (Vishwa)",
        "signature": signature,
        "chapters": chapter_records,
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(output, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)}")
    print(f"  Total chapters: {signature['total_chapters']}")
    print(f"  Total words (Master Narrative): {signature['total_words']:,}")
    print(f"  Act distribution: {signature['act_distribution']}")
    print(f"  Unique hashtags: {len(signature['unique_hashtags'])}")
    print(f"  Top beat tags: {list(signature['beat_frequency'].items())[:5]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
