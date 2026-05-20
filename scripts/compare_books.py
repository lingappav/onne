#!/usr/bin/env python3
"""Compare The President's Rule against the reference book catalog.

Reads data/beats.json (must run extract_beats.py first) and data/references.json.
Writes per-book comparison markdown files to research/comparisons/ plus a
consolidated summary at research/comparisons/_summary.md.

Usage:
    python3 scripts/compare_books.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "src"))

from onne.analysis import compare_to_reference  # noqa: E402
from onne.references import load_references  # noqa: E402


BEATS = ROOT / "data" / "beats.json"
REFS = ROOT / "data" / "references.json"
OUT_DIR = ROOT / "research" / "comparisons"


def main() -> int:
    if not BEATS.exists():
        print("ERROR: data/beats.json not found. Run scripts/extract_beats.py first.",
              file=sys.stderr)
        return 1

    beats = json.loads(BEATS.read_text(encoding="utf-8"))
    signature = beats["signature"]
    references = load_references(REFS)

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    summary_lines = [
        "# Comparative Analysis Summary",
        "",
        f"**The President's Rule** by {beats['author']}",
        f"Total chapters: {signature['total_chapters']} · "
        f"Master Narrative length: {signature['total_words']:,} words",
        "",
        "Compared against the following rich novels:",
        "",
    ]

    print(f"Comparing The President's Rule against {len(references)} reference novels...\n")
    for ref in references:
        comp = compare_to_reference(signature, ref.to_dict())
        # Per-book file
        per_book_path = OUT_DIR / f"{ref.id}.md"
        per_book_path.write_text(_render_comparison(comp, ref), encoding="utf-8")
        summary_lines.append(
            f"- **[{ref.title}]({ref.id}.md)** ({ref.author}, {ref.year}) — "
            f"{len(comp['shared_themes'])} shared themes, "
            f"{len(comp['comparable_aspects_claimed'])} claimed parallels"
        )
        print(f"  ✓ {ref.title} ({ref.year})  →  {per_book_path.relative_to(ROOT)}")

    # PRS inferred profile section
    summary_lines += [
        "",
        "## The President's Rule — Inferred Profile",
        "",
        f"- **Inferred themes:** {', '.join(sorted(set(t for ref in references for t in compare_to_reference(signature, ref.to_dict())['prs_inferred_themes']))) or '(none)'}",
        f"- **Act distribution:** {signature['act_distribution']}",
        f"- **Most frequent beat types:** {', '.join(list(signature['beat_frequency'].keys())[:5])}",
        f"- **Hashtags surfaced:** {', '.join(signature['unique_hashtags'][:10])}{' ...' if len(signature['unique_hashtags']) > 10 else ''}",
        "",
        "## How to read these comparisons",
        "",
        "Each per-book file lists *shared themes*, *structural parallels*, and ",
        "*differentiators*. Use them to identify which reference novels to ",
        "actively study during the writing of each Act. The strongest matches ",
        "should be on your desk during revision.",
    ]

    summary_path = OUT_DIR / "_summary.md"
    summary_path.write_text("\n".join(summary_lines), encoding="utf-8")
    print(f"\nWrote {summary_path.relative_to(ROOT)}")
    return 0


def _render_comparison(comp: dict, ref) -> str:
    lines = [
        f"# {comp['reference_title']} — Comparison to The President's Rule",
        "",
        f"**Author:** {comp['reference_author']}  |  **Year:** {comp['reference_year']}",
        "",
        f"## Reference Book Notes",
        "",
        ref.notes or "_No notes._",
        "",
        f"## Shared Themes ({len(comp['shared_themes'])})",
        "",
    ]
    if comp["shared_themes"]:
        lines += [f"- {t}" for t in comp["shared_themes"]]
    else:
        lines.append("_None inferred. Worth manual review — the heuristic may be missing nuance._")
    lines += [
        "",
        "## Structural Parallels",
        "",
    ]
    lines += [f"- {p}" for p in comp["structural_parallels"]] or ["_None._"]
    lines += [
        "",
        "## Claimed Comparable Aspects (from catalog)",
        "",
    ]
    lines += [f"- {a}" for a in comp["comparable_aspects_claimed"]] or ["_None._"]
    lines += [
        "",
        "## Differentiators",
        "",
    ]
    lines += [f"- {d}" for d in comp["differentiators"]] or ["_None flagged._"]
    lines += [
        "",
        "## What to Study",
        "",
        f"- Re-read **{comp['reference_title']}** to absorb: {', '.join(comp['comparable_aspects_claimed'][:3]) or 'thematic territory'}",
        "- Pull 2–3 scenes that exemplify the strongest shared theme",
        "- Note one technique to *borrow* and one to *avoid* (over-imitation kills voice)",
    ]
    return "\n".join(lines)


if __name__ == "__main__":
    sys.exit(main())
