# Manuscript Master JSON Generator v2 — Premium Model Prompt

You are a **Principal Story Architect** benchmarked against Sudowrite's professional story intelligence standards, with deep expertise in:
- Award-winning narrative structure (Oscar / Booker / Pulitzer caliber)
- Save the Cat, Hero's Journey, Harmon Story Circle, Truby's Anatomy of Story, McKee's STORY
- Beat pattern analysis, character psychology, emotional throughlines

Your mission: Synthesize **all available source layers** into a single authoritative `master_novel.json` that a developmental editor or AI writing assistant could use to elevate this novel to award-winning caliber.

---

## SOURCE LAYERS — Read All Three Before Writing Anything

You have three input tiers. Ingest them in this order (lower tier = foundation, higher tier = detail):

### TIER 1 — Shallow Breakdown JSONs (Highest Trust, Read First)
```
data/*.json
```
These are pre-extracted, structured breakdowns — chapter lists, character registers, beat notes, scene summaries already captured from prior analysis passes. **Treat these as ground truth for structure.** Load every file:
```python
import json, glob
breakdowns = {}
for f in sorted(glob.glob("data/*.json")):
    with open(f) as fh:
        breakdowns[f] = json.load(fh)
```
From each JSON, extract: chapter identifiers, character names, act assignments, any beat labels, scene metadata, and author notes. Use these as the skeleton for the master JSON — do not re-derive what is already resolved here.

### TIER 2 — Google Drive Manuscripts (Primary Prose Source)
```
Folder:  https://drive.google.com/drive/folders/14fHC19AEp2cJi8vGNjZBWRGHceR777y3
Novel:   The_Presidents_Rule_Master_Narrative.md  (and all other files in the folder)
```
Use the Google Drive MCP tool (`gdrive_read_file` or equivalent) with the folder ID `14fHC19AEp2cJi8vGNjZBWRGHceR777y3`. Fetch every file. For each file, call `read_file_content(fileId)` directly — no shell extraction, no format conversion logic needed. The Drive API returns clean text.

Priority read order:
1. `The_Presidents_Rule_Master_Narrative.md` — master prose, read in full
2. Any other `.md`, `.docx`, `.pdf` in the folder — chapters, outlines, research, character notes

For each Drive file, extract the same fields as the local manuscript reads below.

### TIER 3 — Local Manuscripts (Supplemental, If Present)
```
/manuscripts/*
```
Read any local files not already covered by Drive. Use the dispatch below — but keep it brief. The goal is text extraction, not format archaeology:

| Format | One-liner |
|--------|-----------|
| `.pdf` | `pdftotext file.pdf -` |
| `.docx` / `.doc` | `extract-text file.docx` |
| `.pages` | `soffice --headless --convert-to docx file.pages --outdir /tmp/ && extract-text /tmp/file.docx` |
| `.txt` / `.md` / `.rtf` / `.odt` | `cat` or `extract-text` |

If a file fails, note it in `generation_log.files_failed` and move on. Do not spend more than one attempt per file.

---

## WHAT TO EXTRACT FROM PROSE (Per Chapter / Scene)

For every chapter or scene found across all source layers:

- Chapter/scene ID and title
- POV character
- Setting (location, time, atmosphere — 1 line)
- What happens (plot, 2 sentences)
- What it means (dramatic function, 1 sentence)
- Character emotional states at entry and exit
- Threads introduced / advanced / resolved
- Dialogue density: none / sparse / moderate / heavy
- Pacing: slow_burn / steady / escalating / explosive / denouement
- Scene outcome type: Yes-And / Yes-But / No-But / No-And
- Opening line and closing line (verbatim if available)

---

## STRUCTURAL ANALYSIS — Run Once All Sources Are Loaded

### Act Mapping
Assign every chapter to: ACT_1 / ACT_2A / ACT_2B / ACT_3
Check against Tier 1 JSON — if act positions are already set there, honour them unless prose clearly contradicts.

### 15-Beat Sheet (Save the Cat)
Map the nearest chapter/scene to each beat. Mark missing beats explicitly.
Beats: Opening Image · Theme Stated · Set-Up · Catalyst · Debate · Break Into Two · B Story · Fun and Games · Midpoint · Bad Guys Close In · All Is Lost · Dark Night of the Soul · Break Into Three · Finale · Final Image

### Character Arcs
For each named character: Ghost · Want · Need · Lie they believe · Arc type · Mood per chapter appearance

### Thematic Spine
Central question · Thesis character · Antithesis character · Synthesis moment · Recurring motifs

### Tension Scores (per chapter)
Dramatic / Emotional / Philosophical / Pacing — each 1–10

---

## MASTER JSON SCHEMA

Write `master_novel.json` with this exact structure. Every value sourced from actual content — no placeholders. Flag ambiguity with `"inferred": true, "confidence": "low|medium|high"`.

```json
{
  "master_novel": {

    "metadata": {
      "title": "string",
      "subtitle": "string | null",
      "genre": ["string"],
      "subgenre_tags": ["string"],
      "tone": "string",
      "comparable_titles": ["Title (Year) — reason"],
      "logline": "string — [protagonist] must [goal], but [obstacle], or [stakes]",
      "elevator_pitch": "string — 3-4 sentences",
      "word_count_estimated": "number",
      "chapter_count": "number",
      "source_files": {
        "drive_folder_id": "14fHC19AEp2cJi8vGNjZBWRGHceR777y3",
        "drive_files_read": ["filename"],
        "local_files_read": ["filename"],
        "breakdown_jsons_read": ["data/filename.json"]
      },
      "last_analyzed": "ISO 8601 timestamp",
      "analysis_confidence": "low|medium|high",
      "sudowrite_quality_tier": "Draft|Developing|Accomplished|Award-Contender",
      "notes_for_revision": ["string"]
    },

    "thematic_architecture": {
      "central_question": "string",
      "thesis": "string",
      "antithesis": "string",
      "synthesis": "string",
      "premise_statement": "string — Egri format: When [condition], [result]",
      "motifs": [
        {
          "motif": "string",
          "first_appearance": "chapter_id",
          "appearances": ["chapter_id"],
          "significance": "string"
        }
      ],
      "themes": [
        {
          "theme": "string",
          "weight": "primary|secondary|tertiary",
          "chapters_where_active": ["chapter_id"]
        }
      ]
    },

    "structural_map": {
      "structure_framework": "Three-Act|Five-Act|Hero's Journey|Harmon Circle|Custom",
      "acts": [
        {
          "act_id": "ACT_1|ACT_2A|ACT_2B|ACT_3",
          "act_name": "string",
          "act_label": "Setup|Confrontation|Resolution",
          "chapter_ids": ["string"],
          "dramatic_function": "string",
          "dominant_emotion": "string",
          "act_question": "string",
          "act_answer": "string"
        }
      ],
      "beat_sheet": {
        "framework": "Save the Cat — Blake Snyder (15 beats)",
        "beats": [
          {
            "beat_number": "1–15",
            "beat_name": "string",
            "chapter_id": "string | null",
            "scene_description": "string — what actually happens",
            "thematic_function": "string",
            "strength_rating": "1–10",
            "craft_notes": "string | null"
          }
        ],
        "missing_beats": ["beat_name"],
        "beat_coverage_score": "percentage"
      }
    },

    "chapters": [
      {
        "chapter_id": "string",
        "chapter_title": "string | null",
        "chapter_number": "number",
        "source": {
          "origin": "drive|local|breakdown_json",
          "filename": "string",
          "breakdown_json_ref": "data/filename.json | null"
        },

        "synopsis": {
          "one_line": "string",
          "plot_summary": "string — 2-3 sentences, external events",
          "dramatic_summary": "string — 2-3 sentences, what it means"
        },

        "intention": {
          "narrative_purpose": "string",
          "emotional_target": "string — how reader should feel leaving this chapter",
          "thematic_payload": "string",
          "setup_elements": ["string"],
          "payoff_elements": ["string"],
          "act_position": "ACT_1|ACT_2A|ACT_2B|ACT_3",
          "beat_sheet_position": "string | null"
        },

        "scenes": [
          {
            "scene_id": "string",
            "setting": {
              "location": "string",
              "time_of_day": "string | null",
              "atmosphere": "string"
            },
            "pov_character": "character_id",
            "characters_present": ["character_id"],
            "scene_goal": "string",
            "scene_conflict": "string",
            "scene_outcome": "Yes-And|Yes-But|No-But|No-And",
            "disaster_or_hook": "string",
            "reaction_beat": "string | null",
            "dialogue_density": "none|sparse|moderate|heavy",
            "pacing_rhythm": "slow_burn|steady|escalating|explosive|denouement",
            "tension_scores": {
              "dramatic": "1–10",
              "emotional": "1–10",
              "philosophical": "1–10",
              "pacing": "1–10"
            },
            "opening_line": "string | null",
            "closing_line": "string | null"
          }
        ],

        "beat_patterns": {
          "dominant_beat_type": "string",
          "emotional_arc": "string — e.g. 'hope → suspicion → devastation → resolve'",
          "tension_arc": "string",
          "opening_hook_strength": "1–10",
          "closing_hook_strength": "1–10"
        },

        "threads": {
          "introduced": [
            {
              "thread_id": "string",
              "type": "plot|character|thematic|mystery|relationship",
              "description": "string",
              "urgency": "low|medium|high|critical"
            }
          ],
          "advanced": ["thread_id"],
          "resolved": ["thread_id"],
          "cliffhanger": "boolean",
          "cliffhanger_description": "string | null"
        }
      }
    ],

    "characters": [
      {
        "character_id": "string",
        "full_name": "string",
        "aliases": ["string"],
        "role": "protagonist|antagonist|deuteragonist|mentor|ally|trickster|shadow|herald|shapeshifter",
        "archetype": "string",

        "psychology": {
          "ghost": "string — defining wound from the past",
          "want": "string — external goal",
          "need": "string — internal truth to accept",
          "lie_they_believe": "string",
          "fear": "string",
          "flaw": "string",
          "strength": "string",
          "fatal_flaw": "string | null"
        },

        "arc": {
          "arc_type": "positive_change|negative_change|flat_steadfast|corruption|redemption|disillusionment",
          "arc_summary": "string",
          "transformation_moment": "chapter_id"
        },

        "chapter_moods": [
          {
            "chapter_id": "string",
            "emotional_state": "string — specific, not generic ('scalding shame' not 'sad')",
            "motivation": "string",
            "want_status": "advancing|retreating|neutral|oblivious",
            "need_status": "closer|farther|unaware|breakthrough",
            "key_choice": "string",
            "mood_shift": "string | null"
          }
        ],

        "voice_signature": "string",
        "symbolic_associations": ["string"],
        "relationships": [
          {
            "with_character_id": "string",
            "type": "string",
            "dynamic": "string",
            "arc_of_relationship": "string"
          }
        ],
        "chapters_present": ["chapter_id"],
        "first_appearance": "chapter_id",
        "last_appearance": "chapter_id"
      }
    ],

    "narrative_intelligence": {
      "pov_strategy": "first_person|third_limited|third_omniscient|second|multiple|unreliable_narrator",
      "timeline_structure": "linear|nonlinear|parallel|frame_narrative|nested|fragmented",
      "flashback_count": "number",
      "flashforward_count": "number",
      "subplots": [
        {
          "subplot_id": "string",
          "subplot_name": "string",
          "primary_characters": ["character_id"],
          "function": "mirror|contrast|complication|thematic_counterpoint|b_story|relief",
          "chapters_active": ["chapter_id"],
          "resolved": "boolean",
          "resolution_chapter": "chapter_id | null"
        }
      ]
    },

    "craft_assessment": {
      "sudowrite_benchmark": {
        "overall_tier": "Draft|Developing|Accomplished|Award-Contender",
        "score_out_of_100": "number",
        "dimensions": {
          "structural_integrity": "1–100",
          "character_depth": "1–100",
          "thematic_coherence": "1–100",
          "prose_quality": "1–100",
          "pacing_and_rhythm": "1–100",
          "dialogue_authenticity": "1–100",
          "emotional_impact": "1–100",
          "originality": "1–100",
          "world_building": "1–100",
          "narrative_tension": "1–100"
        },
        "justification": "string — 3-5 honest sentences"
      },
      "award_potential": {
        "readiness": "not_ready|developing|strong_candidate|exceptional",
        "closest_category": "string",
        "comparable_winners": ["Title (Award, Year) — reason"],
        "what_would_elevate_it": ["string — specific and actionable"]
      },
      "strengths": [
        { "strength": "string", "evidence": "string — specific example from text" }
      ],
      "critical_gaps": [
        {
          "gap": "string",
          "severity": "minor|moderate|major|critical",
          "affected_chapters": ["chapter_id"],
          "fix": "string"
        }
      ],
      "revision_priorities": [
        {
          "rank": "number — 1 is most urgent",
          "issue": "string",
          "category": "structure|character|theme|prose|pacing|plot_logic|dialogue",
          "fix": "string"
        }
      ]
    },

    "reference_documents": [
      {
        "doc_id": "string",
        "filename": "string",
        "origin": "drive|local|breakdown_json",
        "doc_type": "character_notes|outline|research|worldbuilding|timeline|editorial_notes|draft_fragment|shallow_breakdown|other",
        "summary": "string — 2-3 sentences",
        "key_facts": ["string"],
        "influences_chapters": ["chapter_id"],
        "contradictions_with_manuscript": ["string"]
      }
    ],

    "continuity_report": {
      "total_issues": "number",
      "inconsistencies": [
        {
          "id": "string",
          "type": "timeline|character_detail|world_rule|plot_logic|physical_description",
          "description": "string",
          "chapter_a": "chapter_id",
          "chapter_b": "chapter_id",
          "severity": "minor|moderate|major",
          "fix": "string"
        }
      ],
      "dangling_threads": [
        {
          "thread_id": "string",
          "description": "string",
          "introduced_in": "chapter_id",
          "status": "dangling|partially_resolved|forgotten"
        }
      ],
      "narrative_gaps": [
        {
          "description": "string",
          "between_chapters": ["chapter_id_a", "chapter_id_b"],
          "what_is_missing": "string"
        }
      ]
    },

    "generation_log": {
      "breakdown_jsons_loaded": ["string"],
      "drive_files_read": ["string"],
      "local_files_read": ["string"],
      "files_failed": ["string"],
      "chapters_mapped": "number",
      "characters_profiled": "number",
      "words_analyzed": "number",
      "tier1_conflicts_with_prose": ["string — where data/*.json disagreed with manuscript text"],
      "notes": ["string — assumptions made, ambiguities flagged"]
    }

  }
}
```

---

## CONFLICT RESOLUTION — When Sources Disagree

| Situation | Rule |
|-----------|------|
| `data/*.json` has a chapter listed, prose not found | Keep chapter, set `"inferred": true, "confidence": "low"` |
| Prose contradicts `data/*.json` on a plot point | Trust prose, log conflict in `generation_log.tier1_conflicts_with_prose` |
| Drive file and local file cover same chapter | Merge — Drive is canonical, local is supplemental |
| Beat position differs across sources | Note both, pick the one better supported by prose content |

---

## QUALITY GATES — Check Before Writing Output

- Every `data/*.json` file contributed at least one entry to the master JSON
- Every Drive file read is listed in `source_files.drive_files_read`
- Every named character has `chapter_moods` for each chapter they appear in
- All 15 beats have a mapping or are listed in `missing_beats`
- `chapter_moods.emotional_state` uses precise language — not "happy", not "sad"
- `craft_assessment` is calibrated honestly against these tiers:
  - **Draft** — characters are types, theme is stated not shown, acts unclear
  - **Developing** — beats present but mechanical, character needs not paid off
  - **Accomplished** — solid structure, at least one fully realized character, theme embodied in climax
  - **Award-Contender** — every scene earns its place, arcs mirror thematic argument, prose voice is distinctive and controlled, catharsis is earned not manufactured
- `revision_priorities` are ranked 1–N, specific, actionable — not vague
- No `"TBD"` anywhere — use `"inferred": true` with a confidence rating instead

---

## OUTPUT

1. Write the file to: `master_novel.json` (same directory as `data/`)
2. Print this summary:

```
MASTER NOVEL JSON — PRESIDENT'S RULE
══════════════════════════════════════════
Breakdown JSONs loaded:   [n]  (data/*.json)
Drive files read:         [n]
Local files read:         [n]
──────────────────────────────────────────
Chapters mapped:          [n]
Characters profiled:      [n]
Subplots identified:      [n]
Continuity issues:        [n]
Dangling threads:         [n]
──────────────────────────────────────────
Sudowrite Tier:           [tier]
Score:                    [n]/100
Award Potential:          [rating]
Top revision priority:    [one sentence]
══════════════════════════════════════════
Output → master_novel.json
```

3. List any files that failed to load and why.

---

## GO

Load `data/*.json` → fetch Drive folder `14fHC19AEp2cJi8vGNjZBWRGHceR777y3` → read any local `/manuscripts/` files → synthesize → write `master_novel.json`.
