"""Beat-pattern analysis and comparison against reference novels."""

from __future__ import annotations

from collections import Counter
from typing import Any

from .parser import Chapter


# Heuristic beat-type vocabulary. The classifier matches chapter title + body
# against these keyword buckets to assign a beat tag.
BEAT_KEYWORDS: dict[str, list[str]] = {
    "inciting_incident": ["summons", "announcement", "appointment", "broken compass", "midnight"],
    "world_building": ["delhi", "gambit", "language", "agenda", "press"],
    "rising_tension": ["digital", "backlash", "shadow", "siege", "surveillance", "spying"],
    "moral_test": ["ethical", "bribe", "anchor", "principles", "deal", "confrontation"],
    "external_pressure": ["arrest", "raid", "legal", "PIL", "court", "incision"],
    "internal_conflict": ["family", "dinner", "wife", "diary", "doubt"],
    "climax": ["counter attack", "legacy", "pitch deck", "reset", "unsolved"],
    "resolution": ["reset in democracy", "epilogue", "patient does next", "departure"],
    "policy_didactic": ["fiscal", "welfare", "ATM", "alcohol", "stray", "dog", "tech crime"],
    "crisis_response": ["high-octane", "friday", "flood", "kodagu", "RIP"],
}


def classify_beat(chapter: Chapter) -> list[str]:
    """Return all beat tags that match the chapter, scored by keyword presence."""
    text = (chapter.title + " " + chapter.body).lower()
    return [
        beat for beat, kws in BEAT_KEYWORDS.items()
        if any(kw.lower() in text for kw in kws)
    ]


def beat_signature(chapters: list[Chapter]) -> dict[str, Any]:
    """Return a high-level signature of the novel's beat structure.

    Used to compare against reference novels.
    """
    all_beats: Counter[str] = Counter()
    per_chapter: list[dict[str, Any]] = []
    for ch in chapters:
        tags = classify_beat(ch)
        all_beats.update(tags)
        per_chapter.append({
            "number": ch.number,
            "title": ch.title,
            "act": ch.act,
            "beat_tags": tags,
        })

    return {
        "total_chapters": len(chapters),
        "total_words": sum(ch.word_count for ch in chapters),
        "act_distribution": Counter(ch.act for ch in chapters),
        "beat_frequency": dict(all_beats.most_common()),
        "per_chapter": per_chapter,
        "unique_hashtags": sorted({h for ch in chapters for h in ch.hashtags}),
        "money_mentions_count": sum(len(ch.money_mentioned) for ch in chapters),
        "quote_count": sum(len(ch.quotes) for ch in chapters),
    }


def compare_to_reference(
    prs_signature: dict[str, Any],
    reference: dict[str, Any],
) -> dict[str, Any]:
    """Diff The President's Rule's signature against one reference book's metadata.

    Returns a structured comparison highlighting shared themes, structural
    parallels, and differentiators.
    """
    shared_themes: list[str] = []
    differentiators: list[str] = []
    parallels: list[str] = []

    ref_themes = set(reference.get("themes", []))
    ref_devices = set(reference.get("structural_devices", []))
    comparable_aspects = set(reference.get("comparable_to_prs", []))

    # PRS themes/devices inferred from beat frequency (heuristic mapping)
    prs_themes_inferred: set[str] = set()
    if "moral_test" in prs_signature["beat_frequency"]:
        prs_themes_inferred.add("integrity-under-pressure")
    if "external_pressure" in prs_signature["beat_frequency"]:
        prs_themes_inferred.add("institutional-corruption")
    if "policy_didactic" in prs_signature["beat_frequency"]:
        prs_themes_inferred.add("governance-as-narrative")
    if "internal_conflict" in prs_signature["beat_frequency"]:
        prs_themes_inferred.add("personal-cost-of-public-life")

    for theme in ref_themes:
        if any(theme_word in t for t in prs_themes_inferred for theme_word in theme.lower().split("-")):
            shared_themes.append(theme)
        else:
            differentiators.append(f"reference has '{theme}', not central to PRS")

    if reference.get("act_structure", "").startswith("3-act"):
        parallels.append("Both use a 3-act structure")
    if reference.get("length_words", 0) and prs_signature["total_words"]:
        ratio = prs_signature["total_words"] / reference["length_words"]
        parallels.append(
            f"PRS Master Narrative is {ratio:.1%} the length of {reference['title']}"
        )

    return {
        "reference_title": reference.get("title", "Unknown"),
        "reference_author": reference.get("author", ""),
        "reference_year": reference.get("year"),
        "shared_themes": shared_themes,
        "structural_parallels": parallels,
        "comparable_aspects_claimed": sorted(comparable_aspects),
        "differentiators": differentiators[:5],
        "prs_inferred_themes": sorted(prs_themes_inferred),
    }
