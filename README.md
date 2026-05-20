# The President's Rule — Research & Analysis Repo

A code-driven workspace for the novel **The President's Rule** by Shambhulingappa (Vishwa).
The website (`site/`, `90day_plan.html`) is the human-facing dashboard.
The Python package (`src/onne/`) and scripts (`scripts/`) are the analysis engine.

## What this repo does

1. **Parses the Master Narrative** into a structured beat database (`data/beats.json`).
2. **Compares the novel against a catalog of rich political novels** — Animal Farm, Midnight's Children, A Suitable Boy, All the King's Men, Primary Colors, The White Tiger, The Insider, Train to Pakistan, etc. Outputs side-by-side beat patterns and structural diffs.
3. **Generates per-chapter research briefs** — research gaps, real-world references to verify, legal/policy citations to check, character continuity notes.
4. **Stays code-first** — every analysis is reproducible. Re-run any script, get fresh outputs in `research/`.

## Folder map

```
onne/
├── 90day_plan.html              The dashboard. Open in a browser.
├── site/                        Future expansion of the dashboard (chapter pages, beat viewer)
├── manuscripts/                 All source manuscripts — .md / .pdf / .pages
│                                  (Master Narrative, Table of Contents, chapter drafts,
│                                   Governor PaperWork, Novel Prompts, etc.)
├── src/onne/                    Python package
│   ├── parser.py                Markdown → structured chapter records
│   ├── analysis.py              Beat-pattern analysis & comparison logic
│   └── references.py            Reference-book catalog access
├── scripts/                     Runnable entrypoints
│   ├── extract_beats.py         Master Narrative → data/beats.json
│   ├── compare_books.py         data/beats.json vs data/references.json → research/comparisons/
│   └── research_brief.py        Per-chapter research brief → research/briefs/ch_NN.md
├── data/
│   ├── beats.json               Generated. The President's Rule, structured.
│   └── references.json          Seeded. Rich novels to compare against.
└── research/
    ├── briefs/                  Generated per-chapter research dumps
    └── comparisons/             Generated comparative analyses
```

## Quick start

No third-party dependencies required for the core scripts (stdlib only).

```bash
# 1. Extract beats from Master Narrative → data/beats.json
python3 scripts/extract_beats.py

# 2. Generate comparative analysis → research/comparisons/
python3 scripts/compare_books.py

# 3. Generate per-chapter research briefs → research/briefs/
python3 scripts/research_brief.py
```

## Adding new reference books

Edit `data/references.json` and re-run `scripts/compare_books.py`. The catalog format:

```json
{
  "id": "midnights_children",
  "title": "Midnight's Children",
  "author": "Salman Rushdie",
  "year": 1981,
  "themes": ["nation-as-protagonist", "magical-realism", "post-colonial-identity"],
  "structural_devices": ["unreliable-narrator", "non-linear-time", "frame-story"],
  "comparable_to_prs": ["nation-as-patient metaphor", "individual = state allegory"],
  "act_structure": "3-act with epilogue",
  "length_words": 195000
}
```

## Roadmap (optional Claude API integration)

Install `pip install -e ".[claude]"` and set `ANTHROPIC_API_KEY` to enable automated
scene-by-scene critique, dialogue authenticity checks, and longer-form case studies.
That code is not wired in yet — the starter scripts work without an API key.

## Author

Shambhulingappa (Vishwa) — SWA Member No. 46108
Film option: Sunday Cinemas (24-month, from Feb 2026)
