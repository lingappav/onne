#!/usr/bin/env python3
"""Generate a per-chapter research brief for The President's Rule.

For each chapter, surfaces:
  - Real-world references to verify (rupee figures, real cases, real laws)
  - Hashtags / digital culture cues that need authenticity check
  - Character continuity notes
  - Open research questions
  - Comparable scenes in the reference catalog

Writes one markdown file per chapter to research/briefs/ch_NN.md plus an
_index.md.

Usage:
    python3 scripts/research_brief.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "src"))

from onne.references import load_references  # noqa: E402

BEATS = ROOT / "data" / "beats.json"
REFS = ROOT / "data" / "references.json"
OUT_DIR = ROOT / "research" / "briefs"


# Research prompt templates — what to verify for different beat types.
RESEARCH_PROMPTS = {
    "inciting_incident": [
        "Verify constitutional procedure for appointing a Special Administrator under President's Rule (Article 356).",
        "Real-world precedent: S.R. Bommai v. Union of India (1994). What does it say about misuse of Article 356?",
        "Has any state-level Special Administrator been appointed from outside the political/civil service tradition in modern India?",
    ],
    "world_building": [
        "Verify Karnataka coalition dynamics in the relevant time window (2023–2026). JD(S), INC, BJP power-sharing facts.",
        "Real Vidhana Soudha protocol: who actually meets the Governor / Administrator?",
        "Sample real PMO press briefings — match tone and structure.",
    ],
    "rising_tension": [
        "Sample real Twitter/X hashtags that have trended against Indian administrators. Cadence, vocabulary, who amplifies.",
        "How does India's digital fact-check ecosystem (Alt News, BoomLive) react to fabricated political audio? Verify mechanics.",
        "Surveillance: real reporting on Pegasus, NSO Group in Indian political context.",
    ],
    "moral_test": [
        "Real CSR contribution structures used as quasi-bribes — case studies from Indian corporate disclosures.",
        "How are tender bypass mechanisms actually structured? Verify the Rs. 500 Cr scale is plausible for a single contract.",
    ],
    "external_pressure": [
        "Verify how Indian magistrate-level court seals on records vaults actually work. Time required, jurisdiction.",
        "Real raid coordination — Enforcement Directorate, CBI, Income Tax. 12 simultaneous raids: is this operationally realistic?",
        "PIL filing fees, timelines, and typical Supreme Court bench responses.",
    ],
    "internal_conflict": [
        "Read 3 memoirs of IAS/IPS wives or political spouses for the authentic emotional register.",
        "Verify the domestic detail: what does a senior bureaucrat's Bengaluru official residence actually look like?",
    ],
    "climax": [
        "Verify Kodagu land-use law: how would 30,000 acres of protected coffee land reclassification actually be triggered?",
        "Parliamentary question procedure: what does a 'subject of a Parliamentary question' actually mean operationally?",
        "Real cases where a 120-page legacy report from an outgoing administrator influenced policy.",
    ],
    "resolution": [
        "Cubbon Park geography: actual chai vendor locations, jogging routes, sound at 6 AM.",
        "Real 6 AM departures of senior officials — RTI on logbooks would help anchor this.",
        "Sahitya Akademi precedents for political fiction recognition.",
    ],
    "policy_didactic": [
        "Verify the policy being dramatised: is the lever Sampath pulls actually within the Special Administrator's powers?",
        "Real compliance numbers from comparable digital-payment mandates (UPI rollout, GeM, etc.).",
        "Health-policy literature on alcohol outlet density vs. public health outcomes — Karnataka-specific data.",
    ],
    "crisis_response": [
        "Real flood response in Kodagu (2018, 2019). Personnel, supply chains, what actually fails.",
        "Real-time decision-making protocols: how many decisions does a Chief Secretary actually take in a day?",
    ],
}


def main() -> int:
    if not BEATS.exists():
        print("ERROR: data/beats.json not found. Run scripts/extract_beats.py first.",
              file=sys.stderr)
        return 1

    beats = json.loads(BEATS.read_text(encoding="utf-8"))
    references = load_references(REFS)
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    index_lines = [
        "# Research Briefs — Index",
        "",
        "One brief per chapter. Use these as the research punch list before drafting each chapter.",
        "",
    ]

    print(f"Generating research briefs for {len(beats['chapters'])} chapters...\n")
    for ch in beats["chapters"]:
        ch_id = _chapter_id(ch["number"])
        brief = _render_brief(ch, references)
        out_path = OUT_DIR / f"{ch_id}.md"
        out_path.write_text(brief, encoding="utf-8")
        index_lines.append(f"- [Ch {ch['number']} — {ch['title']}]({ch_id}.md) ({ch['act']})")
        print(f"  ✓ Ch {ch['number']}: {ch['title']}  →  {out_path.relative_to(ROOT)}")

    (OUT_DIR / "_index.md").write_text("\n".join(index_lines), encoding="utf-8")
    print(f"\nWrote {(OUT_DIR / '_index.md').relative_to(ROOT)}")
    return 0


def _chapter_id(num) -> str:
    if isinstance(num, int):
        return f"ch_{num:02d}"
    return "epilogue"


def _render_brief(ch: dict, references: list) -> str:
    lines = [
        f"# Research Brief — Chapter {ch['number']}: {ch['title']}",
        "",
        f"**Act:** {ch['act']}  |  **Beat tags:** {', '.join(ch['beat_tags']) or '_none classified_'}",
        "",
        "## Body Preview",
        "",
        f"> {ch['body_preview']}…",
        "",
        "## Unique Details to Honour (from Master Narrative)",
        "",
    ]
    if ch["unique_details"]:
        lines += [f"- {d}" for d in ch["unique_details"]]
    else:
        lines.append("_No structured detail block found in source._")

    lines += ["", "## Key Insight (Authorial Stance)", "", ch.get("key_insight") or "_Not extracted._", ""]

    lines += ["## Hashtags / Digital Culture in This Chapter", ""]
    if ch["hashtags"]:
        lines += [f"- `{h}` — verify usage pattern, who amplifies, how it dies down" for h in ch["hashtags"]]
    else:
        lines.append("_No hashtags surfaced — confirm if digital backlash is absent or just unwritten._")

    lines += ["", "## Rupee / Numerical Claims to Verify", ""]
    if ch["money_mentioned"]:
        lines += [f"- {m} — confirm plausibility against real Karnataka/Indian data" for m in ch["money_mentioned"]]
    else:
        lines.append("_No specific rupee figures — confirm if quantification would strengthen this chapter._")

    lines += ["", "## Quoted Lines (Already Locked in Master Narrative)", ""]
    if ch["quotes"]:
        lines += [f"> {q}" for q in ch["quotes"][:8]]
    else:
        lines.append("_No quoted dialogue in source. Dialogue needs to be drafted from scratch._")

    lines += ["", "## Research Punch List", ""]
    prompts = []
    for tag in ch["beat_tags"]:
        prompts.extend(RESEARCH_PROMPTS.get(tag, []))
    if not prompts:
        prompts = ["No beat-specific prompts. Read 2 newspaper archives from the chapter's setting period."]
    for p in dict.fromkeys(prompts):  # dedupe, preserve order
        lines.append(f"- [ ] {p}")

    lines += ["", "## Comparable Scenes in Reference Catalog", ""]
    matches = _match_references(ch, references)
    if matches:
        for ref, reason in matches:
            lines.append(f"- **{ref.title}** ({ref.author}) — {reason}")
    else:
        lines.append("_No automatic matches. Manually identify 1–2 reference scenes to study._")

    lines += [
        "",
        "## Open Questions for the Author",
        "",
        "- [ ] What is the SINGLE most important thing this chapter must accomplish for the novel's spine?",
        "- [ ] What would be LOST if this chapter were cut? (If 'nothing', cut it.)",
        "- [ ] Whose POV does this chapter actually serve? Could a secondary character carry it better?",
        "- [ ] What real-world detail is most likely to be challenged by a Karnataka reader? Verify it.",
        "",
    ]
    return "\n".join(lines)


def _match_references(ch: dict, references: list) -> list[tuple]:
    """Match chapter beat tags to reference books that share comparable aspects."""
    tag_to_keywords = {
        "moral_test": ["honest", "moral", "principle", "corruption"],
        "external_pressure": ["legal", "raid", "court", "press"],
        "internal_conflict": ["domestic", "family", "wife", "interior"],
        "rising_tension": ["surveillance", "media", "language-distortion"],
        "policy_didactic": ["governance", "policy", "administrative"],
        "resolution": ["legacy", "reset", "departure"],
    }
    matches = []
    for tag in ch["beat_tags"]:
        keywords = tag_to_keywords.get(tag, [])
        for ref in references:
            haystack = " ".join(ref.comparable_to_prs + ref.themes + ref.structural_devices).lower()
            if any(kw in haystack for kw in keywords):
                reason = f"shares '{tag}' resonance — see catalog notes"
                if (ref, reason) not in matches:
                    matches.append((ref, reason))
    return matches[:4]


if __name__ == "__main__":
    sys.exit(main())
