"""Parse the Master Narrative markdown into structured chapter records."""

from __future__ import annotations

import re
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Any


CHAPTER_HEADING = re.compile(r"^##\s+Chapter\s+(\d+)\s+[—-]\s+(.+?)\s*$", re.MULTILINE)
EPILOGUE_HEADING = re.compile(r"^##\s+Epilogue\s+[—-]\s+(.+?)\s*$", re.MULTILINE)
ACT_HEADING = re.compile(r"^#\s+ACT\s+(I{1,3})\s+[—-]\s+(.+?)\s*$", re.MULTILINE)
UNIQUE_DETAIL_LINE = re.compile(r"^>\s*-\s*(.+?)\s*$", re.MULTILINE)
KEY_INSIGHT = re.compile(r"^\*\*Key Insight:\*\*\s*(.+?)(?=\n\n|\n---|\Z)", re.DOTALL | re.MULTILINE)
RUPEE_AMOUNTS = re.compile(r"Rs\.?\s*\d[\d,]*\s*(?:crore|lakh|Cr|L)?", re.IGNORECASE)
HASHTAGS = re.compile(r"#[A-Za-z][A-Za-z0-9_]+")
NAMED_QUOTE = re.compile(r">\s*\*\"(.+?)\"\*", re.DOTALL)


@dataclass
class Chapter:
    """A structured record of one chapter in the Master Narrative."""

    number: int | str  # int for chapters, "Epilogue" for epilogue
    title: str
    act: str  # "I", "II", "III", or "Epilogue"
    body: str = ""
    unique_details: list[str] = field(default_factory=list)
    key_insight: str = ""
    quotes: list[str] = field(default_factory=list)
    hashtags: list[str] = field(default_factory=list)
    money_mentioned: list[str] = field(default_factory=list)
    word_count: int = 0

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def parse_master_narrative(md_path: Path | str) -> list[Chapter]:
    """Parse the Master Narrative .md file into a list of Chapter records.

    Detects act boundaries from `# ACT I/II/III` headings and assigns each
    chapter to its act. Extracts unique details, key insights, quotes,
    hashtags, and rupee amounts.
    """
    md_path = Path(md_path)
    text = md_path.read_text(encoding="utf-8")

    # Map start-position → act label so we can look up each chapter's act
    act_markers: list[tuple[int, str]] = []
    for m in ACT_HEADING.finditer(text):
        act_markers.append((m.start(), m.group(1)))

    def act_for_position(pos: int) -> str:
        current = "I"
        for start, label in act_markers:
            if start <= pos:
                current = label
        return current

    # Find chapter sections
    chapter_matches = list(CHAPTER_HEADING.finditer(text))
    epilogue_match = EPILOGUE_HEADING.search(text)

    chapters: list[Chapter] = []
    for i, m in enumerate(chapter_matches):
        num = int(m.group(1))
        title = m.group(2).strip()
        body_start = m.end()
        body_end = (
            chapter_matches[i + 1].start()
            if i + 1 < len(chapter_matches)
            else (epilogue_match.start() if epilogue_match else len(text))
        )
        body = text[body_start:body_end].strip()
        chapters.append(_build_chapter(num, title, act_for_position(m.start()), body))

    if epilogue_match:
        title = epilogue_match.group(1).strip()
        body_start = epilogue_match.end()
        # Epilogue ends at the next top-level # heading or appendix
        appendix_match = re.search(r"^#\s+Appendix", text[body_start:], re.MULTILINE)
        body_end = body_start + (appendix_match.start() if appendix_match else len(text) - body_start)
        body = text[body_start:body_end].strip()
        chapters.append(_build_chapter("Epilogue", title, "Epilogue", body))

    return chapters


def _build_chapter(num: int | str, title: str, act: str, body: str) -> Chapter:
    unique = [d.strip() for d in UNIQUE_DETAIL_LINE.findall(body)]
    insight_match = KEY_INSIGHT.search(body)
    insight = insight_match.group(1).strip() if insight_match else ""
    quotes = [q.strip() for q in NAMED_QUOTE.findall(body)]
    hashtags = list(dict.fromkeys(HASHTAGS.findall(body)))  # dedupe, preserve order
    money = list(dict.fromkeys(m.group(0).strip() for m in RUPEE_AMOUNTS.finditer(body)))
    return Chapter(
        number=num,
        title=title,
        act=act,
        body=body,
        unique_details=unique,
        key_insight=insight,
        quotes=quotes,
        hashtags=hashtags,
        money_mentioned=money,
        word_count=len(body.split()),
    )
