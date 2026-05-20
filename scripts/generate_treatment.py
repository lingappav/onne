#!/usr/bin/env python3
"""Generate a registration-ready Treatment for The President's Rule.

Composes a clean, single-document Treatment suitable for filing with the
Screenwriters Association of India (SWA) and/or the Writers Guild of
America West (WGAW) Registry.

Reads:
    manuscripts/The_Presidents_Rule_Master_Narrative.md  (chapters)
    data/treatment_meta.json                              (title, logline, synopsis)
    data/characters.json                                  (character bibles)

Writes:
    treatment/THE_PRESIDENTS_RULE_TREATMENT.md
    treatment/THE_PRESIDENTS_RULE_TREATMENT.html        (print-styled, → PDF via browser)
    treatment/THE_PRESIDENTS_RULE_TREATMENT.txt        (plain-text, upload-friendly)
    treatment/REGISTRATION_CHECKLIST.md                (filing instructions)

Usage:
    python3 scripts/generate_treatment.py
"""

from __future__ import annotations

import hashlib
import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "src"))

from onne.parser import parse_master_narrative, Chapter  # noqa: E402


MASTER_NARRATIVE = ROOT / "manuscripts" / "The_Presidents_Rule_Master_Narrative.md"
META_PATH = ROOT / "data" / "treatment_meta.json"
CHARS_PATH = ROOT / "data" / "characters.json"
OUT_DIR = ROOT / "treatment"


# ─────────────────────────────────────────────────────────────────────────────
# Section renderers (format-agnostic — return plain strings)
# ─────────────────────────────────────────────────────────────────────────────


def render_title_page_md(meta: dict) -> str:
    auth = meta["author"]
    return f"""# {meta['title'].upper()}

## {meta['subtitle']}

*{meta['tagline']}*

---

**Form:** {meta['form']}

**Author:** {auth['name']}
**SWA Membership No.:** {auth['swa_member_no']}
**Contact:** {auth['email']}
**Country:** {auth['country']}

**Date of this Treatment:** {date.today().isoformat()}
**Copyright © {meta['registration']['copyright_year']} — {auth['name']}. All rights reserved.**

This treatment is the sole intellectual property of the Author named above.
No part of this document may be reproduced, adapted, or transmitted in any
form without the Author's prior written consent, except in connection with
formal registration with the Screenwriters Association of India and the
Writers Guild of America West Registry.

---
"""


def render_logline_md(meta: dict) -> str:
    return f"""## Logline

{meta['logline']}

---
"""


def render_synopsis_md(meta: dict) -> str:
    return f"""## Short Synopsis

{meta['synopsis_short']}

---

## Extended Synopsis

{meta['synopsis_long']}

---
"""


def render_themes_md(meta: dict) -> str:
    lines = ["## Thematic Statement", ""]
    lines.append("This novel argues the following, in nine propositions:")
    lines.append("")
    for i, theme in enumerate(meta["themes"], 1):
        lines.append(f"{i}. **{theme}**")
    lines += ["", "---", ""]
    return "\n".join(lines)


def render_structure_md(meta: dict) -> str:
    s = meta["structure"]
    lines = [
        "## Structure",
        "",
        f"**Form:** {s['form']}",
        f"**Total chapters:** {s['total_chapters']}{'  + Epilogue' if s['has_epilogue'] else ''}",
        f"**Estimated final length:** {s['estimated_final_length_words']:,} words",
        "",
    ]
    for act in s["acts"]:
        lines += [
            f"### {act['name']}",
            f"**Chapters:** {act['chapters']}",
            "",
            act["summary"],
            "",
        ]
    lines += ["---", ""]
    return "\n".join(lines)


def render_characters_md(chars: dict) -> str:
    lines = ["## Principal Cast", ""]
    for c in chars["principal"]:
        lines += [f"### {c['name']}", f"*{c.get('role', '')}*", ""]
        if c.get("origin"):
            lines.append(f"**Origin:** {c['origin']}")
        if c.get("profession"):
            lines.append(f"**Profession:** {c['profession']}")
        if c.get("age_range"):
            lines.append(f"**Age:** {c['age_range']}")
        lines.append(f"**Introduced in:** {c.get('introduced_in', '—')}")
        lines += ["", c["description"], ""]
        if c.get("arc"):
            lines += [f"**Arc:** {c['arc']}", ""]
        if c.get("key_quotes"):
            lines.append("**Locked Dialogue:**")
            for q in c["key_quotes"]:
                lines.append(f"> *“{q}”*")
            lines.append("")
        lines.append("")

    lines += ["## Supporting Cast", ""]
    for c in chars["supporting"]:
        lines += [f"### {c['name']}", f"*{c.get('role', '')}*", ""]
        lines.append(f"**Introduced in:** {c.get('introduced_in', '—')}")
        lines += ["", c["description"], ""]
        if c.get("key_quotes"):
            for q in c["key_quotes"]:
                lines.append(f"> *“{q}”*")
            lines.append("")

    lines += ["## Ensemble & Background", ""]
    for e in chars["ensemble_background"]:
        lines.append(f"- {e}")
    lines += ["", "---", ""]
    return "\n".join(lines)


def render_treatment_body_md(chapters: list[Chapter], meta: dict) -> str:
    lines = ["## Chapter-by-Chapter Treatment", "",
             "_The following twenty-four chapters and epilogue constitute the complete narrative spine "
             "of the novel. Each chapter is presented with its title, the central beat, locked "
             "dialogue, and the authorial key insight that anchors the chapter's place in the "
             "novel's thematic argument._", ""]

    # Group chapters by act for clearer reading
    current_act = None
    for ch in chapters:
        if ch.act != current_act:
            current_act = ch.act
            act_label = _act_label(ch.act, meta)
            lines += ["", f"### {act_label}", ""]

        # Heading
        if isinstance(ch.number, int):
            heading = f"#### Chapter {ch.number} — {ch.title}"
        else:
            heading = f"#### {ch.title}"  # epilogue
        lines += [heading, ""]

        # Treatment paragraphs
        lines.append(_compose_chapter_paragraph(ch))
        lines.append("")

        # Locked dialogue (max 4 quotes)
        if ch.quotes:
            lines.append("**Locked dialogue & on-record lines:**")
            for q in ch.quotes[:4]:
                clean = q.strip().strip('"').strip("”").strip("“")
                lines.append(f"> *“{clean}”*")
            lines.append("")

        # Specific numerical claims (rupee figures, percentages)
        if ch.money_mentioned:
            lines.append("**Specific quantitative beats:** " +
                         ", ".join(ch.money_mentioned))
            lines.append("")

        # Hashtags / digital cues
        if ch.hashtags:
            lines.append("**Digital culture cues:** " +
                         ", ".join(f"`{h}`" for h in ch.hashtags))
            lines.append("")

        # Key insight
        if ch.key_insight:
            lines += [f"**Authorial key insight:** {ch.key_insight}", ""]

        lines.append("---")
        lines.append("")
    return "\n".join(lines)


def _act_label(act: str, meta: dict) -> str:
    s = meta["structure"]
    for a in s["acts"]:
        if a["name"].split(" — ")[0].endswith(act):
            return a["name"]
    if act == "Epilogue":
        return "Epilogue"
    return f"Act {act}"


def _compose_chapter_paragraph(ch: Chapter) -> str:
    """Compose a 2-3 sentence treatment paragraph from structured chapter data."""
    # Strategy: use unique details for the "what happens" content;
    # close with a beat about consequence/turn.
    details = [d for d in ch.unique_details if not d.lower().startswith(("primary:", "expanded source", "claude_gen unique", "primary source", "website:", "pitch_deck:"))]
    # Strip the SOURCE tags from remaining lines if any
    clean_details = []
    for d in ch.unique_details:
        for tag in ("PRIMARY:", "EXPANDED SOURCE", "CLAUDE_GEN UNIQUE:", "PRIMARY SOURCE", "WEBSITE:", "PITCH_DECK:"):
            if d.upper().startswith(tag):
                d = d.split(":", 1)[-1].strip() if ":" in d else d
                break
        clean_details.append(d)

    if clean_details:
        # Pick the 2-3 most narratively dense details — the longer ones tend to be scene-setting
        sorted_details = sorted(clean_details, key=len, reverse=True)
        narrative = ". ".join(d.rstrip(".").strip(" -") for d in sorted_details[:3])
    else:
        narrative = ch.body[:400].strip().replace("\n", " ")

    return narrative + ("." if not narrative.endswith(".") else "")


def render_sources_md(meta: dict) -> str:
    lines = [
        "## Chain of Authorship & Source Materials",
        "",
        "This treatment is the consolidated work product of the following source "
        "documents, all authored by the undersigned and held within the repository "
        "of record at the location stated in the registration filing. Each source "
        "file is preserved in the `manuscripts/` directory of the master repository:",
        "",
    ]
    for src in meta["registration"]["source_materials_chain"]:
        lines.append(f"- {src}")
    lines += [
        "",
        "**Rights Status:** " + meta["registration"]["rights_status"],
        "",
        "---",
        "",
    ]
    return "\n".join(lines)


def render_declaration_md(meta: dict, content_hash: str) -> str:
    auth = meta["author"]
    return f"""## Declaration of Authorship

I, **{auth['name']}**, the undersigned, declare that:

1. I am the sole and original author of the work titled *{meta['title']}*, the
   treatment of which is set out in full in this document.
2. The story, structure, characters, dialogue, and thematic content are
   wholly original to me, save for incidental references to public events,
   public figures, and public institutions, which appear in fictionalised form.
3. I am the holder of all moral and economic rights in this work. No portion
   of the work has been assigned, transferred, or licensed to any third party
   except as expressly stated in *Section: Chain of Authorship & Source
   Materials* above.
4. I submit this treatment for the purpose of formal registration with the
   Screenwriters Association of India (Member No. {auth['swa_member_no']}) and,
   as applicable, the Writers Guild of America West Registry, to establish
   the date of authorship and the integrity of the chain of creation.
5. The content hash of this document at the time of generation is:

   **SHA-256:** `{content_hash}`

   This hash allows me, or any future arbiter, to verify that the document
   filed corresponds bit-for-bit to the version generated by the master
   repository on the date stated below.

**Date:** {date.today().isoformat()}
**Author:** {auth['name']}
**SWA Member No.:** {auth['swa_member_no']}
**Email of Record:** {auth['email']}

_Signature: ___________________________________________________________________

---

*End of Treatment — The President's Rule*
"""


# ─────────────────────────────────────────────────────────────────────────────
# Format converters
# ─────────────────────────────────────────────────────────────────────────────


def md_to_txt(md: str) -> str:
    """Strip markdown to plain text, preserving structure for SWA upload forms."""
    out_lines = []
    for line in md.splitlines():
        # Headings → uppercased / underlined
        if line.startswith("# "):
            t = line[2:].strip()
            out_lines += [t.upper(), "=" * len(t)]
        elif line.startswith("## "):
            t = line[3:].strip()
            out_lines += [t.upper(), "-" * len(t)]
        elif line.startswith("### "):
            out_lines.append(line[4:].strip())
        elif line.startswith("#### "):
            out_lines.append(line[5:].strip())
        elif line.strip() == "---":
            out_lines.append("")
        else:
            # Strip markdown syntax
            cleaned = (
                line.replace("**", "")
                    .replace("*", "")
                    .replace("`", "")
                    .replace("> ", "    ")
            )
            out_lines.append(cleaned)
    return "\n".join(out_lines)


def md_to_html(md: str, meta: dict) -> str:
    """Convert markdown → print-ready HTML. Avoids external deps by handling
    just the markdown features we use."""
    lines = md.splitlines()
    html_lines: list[str] = []
    in_blockquote = False
    in_list = False

    def close_open():
        nonlocal in_blockquote, in_list
        if in_blockquote:
            html_lines.append("</blockquote>")
            in_blockquote = False
        if in_list:
            html_lines.append("</ul>")
            in_list = False

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("#### "):
            close_open()
            html_lines.append(f"<h4>{_inline(stripped[5:])}</h4>")
        elif stripped.startswith("### "):
            close_open()
            html_lines.append(f"<h3>{_inline(stripped[4:])}</h3>")
        elif stripped.startswith("## "):
            close_open()
            html_lines.append(f"<h2>{_inline(stripped[3:])}</h2>")
        elif stripped.startswith("# "):
            close_open()
            html_lines.append(f"<h1>{_inline(stripped[2:])}</h1>")
        elif stripped == "---":
            close_open()
            html_lines.append('<hr class="rule">')
        elif stripped.startswith("> "):
            if not in_blockquote:
                html_lines.append("<blockquote>")
                in_blockquote = True
            html_lines.append(f"<p>{_inline(stripped[2:])}</p>")
        elif stripped.startswith("- "):
            if in_blockquote:
                close_open()
            if not in_list:
                html_lines.append("<ul>")
                in_list = True
            html_lines.append(f"<li>{_inline(stripped[2:])}</li>")
        elif stripped == "":
            close_open()
            html_lines.append("")
        else:
            close_open()
            html_lines.append(f"<p>{_inline(stripped)}</p>")
    close_open()
    body = "\n".join(html_lines)

    css = """
    @page { size: A4; margin: 22mm 18mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Georgia', 'Times New Roman', serif; line-height: 1.55; color: #111; max-width: 760px; margin: 0 auto; padding: 30px 24px 60px; }
    h1 { font-size: 28pt; text-align: center; margin: 60px 0 12px; letter-spacing: 2px; page-break-before: avoid; }
    h2 { font-size: 18pt; margin: 36px 0 14px; border-bottom: 1.5px solid #111; padding-bottom: 6px; page-break-after: avoid; }
    h3 { font-size: 14pt; margin: 28px 0 10px; color: #1e2533; page-break-after: avoid; }
    h4 { font-size: 12pt; margin: 22px 0 8px; color: #1a1a1a; page-break-after: avoid; }
    p { margin: 0 0 12px; text-align: justify; }
    blockquote { margin: 14px 30px; padding-left: 14px; border-left: 3px solid #999; color: #333; font-style: italic; }
    blockquote p { text-align: left; }
    ul { margin: 10px 0 14px 24px; }
    li { margin-bottom: 4px; }
    hr.rule { border: none; border-top: 1px solid #ccc; margin: 28px 0; }
    h4 + p, h3 + p { margin-top: 2px; }
    @media print {
      body { max-width: none; padding: 0; }
      h2 { page-break-before: auto; }
      h4 { page-break-before: avoid; }
    }
    """
    title = meta["title"]
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>{title} — Treatment</title>
<style>{css}</style></head><body>
{body}
</body></html>
"""


def _inline(s: str) -> str:
    """Apply inline markdown (bold, italic, code) → HTML."""
    import re
    # Order matters: bold (**...**) before italic (*...*)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<!\w)\*([^*]+?)\*(?!\w)", r"<em>\1</em>", s)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    return s


# ─────────────────────────────────────────────────────────────────────────────
# Registration checklist
# ─────────────────────────────────────────────────────────────────────────────


REGISTRATION_CHECKLIST = """# Registration Checklist — The President's Rule

This checklist guides the formal IP registration of the treatment generated
by `scripts/generate_treatment.py`. Follow the steps in order.

---

## 1. Pre-Filing — Verify the Generated Treatment

- [ ] Open `treatment/THE_PRESIDENTS_RULE_TREATMENT.html` in a browser
- [ ] Use **File → Print → Save as PDF** (A4, default margins) to produce
      `THE_PRESIDENTS_RULE_TREATMENT.pdf`
- [ ] Confirm: title page, logline, synopsis, themes, all 24 chapters + epilogue,
      character section, source materials, declaration, and content hash are
      all present.
- [ ] Read the Declaration of Authorship at the end. Sign a printed copy
      and keep with your records (the digital signature line is for filing).

## 2. SWA India — Primary Registration (Member No. 46108)

The Screenwriters Association of India is your primary registry.

- [ ] Visit: **https://swaindia.org/registration**
- [ ] Log in with your existing Member ID **46108**
- [ ] Select **Online Registration**
- [ ] Title: *The President's Rule*
- [ ] Form: **Story** or **Story Outline** (treatment falls under Story for SWA)
- [ ] Upload: `THE_PRESIDENTS_RULE_TREATMENT.pdf` (must be < 10 MB; if larger,
      use the .txt version as a fallback)
- [ ] Pay the registration fee (₹500 for SWA members at time of writing —
      confirm current rate)
- [ ] **Download the SWA Registration Certificate immediately and save it to
      `registration/SWA_Certificate_<date>.pdf`** in this repository
- [ ] Commit the certificate to git so the timestamp is preserved alongside
      the work itself

## 3. WGAW Registry — Secondary Registration (Recommended)

The Writers Guild of America West Registry provides a US legal-record copy.
Non-members can register at the same fee.

- [ ] Visit: **https://www.wgawregistry.org**
- [ ] Create an account (use email of record: lingappa.vishwa@gmail.com)
- [ ] Click **Register Your Work**
- [ ] Type: **Novel / Treatment**
- [ ] Title: *The President's Rule*
- [ ] Author: Vishwa Shambhulingappa
- [ ] Upload: `THE_PRESIDENTS_RULE_TREATMENT.pdf` (or .txt if size limits apply)
- [ ] Pay the $25 USD registration fee
- [ ] Download the WGAW Registration Certificate and save it to
      `registration/WGAW_Certificate_<date>.pdf`

## 4. Optional but Strongly Recommended — Indian Copyright Office

A statutory copyright registration with the Government of India is the
strongest claim available.

- [ ] Visit: **https://copyright.gov.in/UserRegistration/frmLoginPage.aspx**
- [ ] Select **Literary/Dramatic Work**
- [ ] Submit Form XIV with the treatment + statement of particulars
- [ ] Fee: ₹500 for a literary work
- [ ] This takes 6–12 months but provides the strongest legal evidence

## 5. Self-Maintained Evidence

Independent of any registry, maintain the following inside this repository:

- [ ] **Git history is your timeline.** The first commit on this repo (5db…
      or whichever hash) is your earliest provable date. Push every meaningful
      revision to GitHub.
- [ ] **Content hash.** The SHA-256 printed inside the treatment document
      itself is a self-verifying fingerprint. Save the hash separately in
      `registration/CONTENT_HASHES.md` whenever you regenerate the treatment.
- [ ] **Sunday Cinemas option agreement** (Governor_PaperWork). Keep the
      original signed copy in `manuscripts/` (already committed).

## 6. After Filing — Annotate the Repository

- [ ] Create `registration/` folder at repo root
- [ ] Save certificates with dated filenames
- [ ] Update the README with the registration numbers and dates
- [ ] Tag the git commit at the moment of filing:
      `git tag -a v1.0-treatment-filed -m "Treatment filed with SWA + WGAW"`
- [ ] Push the tag: `git push --tags`

---

## Notes on Registration Forms

**For SWA India:** They accept "Story Outline" as a category. Your treatment
qualifies. Do not select "Screenplay" unless you also have a screenplay form;
this is a novel treatment.

**For WGAW Registry:** Their definition of "Treatment" matches yours — a
prose narrative summary of a longer work. PDF is the preferred format; their
upload accepts up to 25 MB.

**For both:** What you are registering is the *expression* of the story, not
the *idea*. Concepts ("a doctor becomes governor") are not protectable; the
*specific* characters, dialogue, scene order, and language are. The generated
treatment is rich in all four — protect it accordingly.

---

*This checklist was generated alongside the treatment. Re-run
`scripts/generate_treatment.py` whenever the treatment changes, and re-file
the updated version (most registries allow amendments at a reduced fee).*
"""


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────


def main() -> int:
    if not MASTER_NARRATIVE.exists():
        print(f"ERROR: {MASTER_NARRATIVE} not found.", file=sys.stderr)
        return 1
    if not META_PATH.exists() or not CHARS_PATH.exists():
        print(f"ERROR: data/treatment_meta.json and/or data/characters.json missing.",
              file=sys.stderr)
        return 1

    print(f"Parsing {MASTER_NARRATIVE.relative_to(ROOT)}...")
    chapters = parse_master_narrative(MASTER_NARRATIVE)
    print(f"  {len(chapters)} chapters parsed.")

    meta = json.loads(META_PATH.read_text(encoding="utf-8"))
    chars = json.loads(CHARS_PATH.read_text(encoding="utf-8"))

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # Compose the body (without declaration first — we hash the body, then
    # embed the hash in the declaration, then write the final document).
    body_sections = [
        render_title_page_md(meta),
        render_logline_md(meta),
        render_synopsis_md(meta),
        render_themes_md(meta),
        render_structure_md(meta),
        render_characters_md(chars),
        render_treatment_body_md(chapters, meta),
        render_sources_md(meta),
    ]
    body_md = "\n".join(body_sections)
    content_hash = hashlib.sha256(body_md.encode("utf-8")).hexdigest()

    full_md = body_md + "\n" + render_declaration_md(meta, content_hash)

    md_path = OUT_DIR / "THE_PRESIDENTS_RULE_TREATMENT.md"
    md_path.write_text(full_md, encoding="utf-8")
    print(f"  ✓ Wrote {md_path.relative_to(ROOT)}  ({len(full_md):,} chars)")

    txt = md_to_txt(full_md)
    txt_path = OUT_DIR / "THE_PRESIDENTS_RULE_TREATMENT.txt"
    txt_path.write_text(txt, encoding="utf-8")
    print(f"  ✓ Wrote {txt_path.relative_to(ROOT)}  ({len(txt):,} chars)")

    html = md_to_html(full_md, meta)
    html_path = OUT_DIR / "THE_PRESIDENTS_RULE_TREATMENT.html"
    html_path.write_text(html, encoding="utf-8")
    print(f"  ✓ Wrote {html_path.relative_to(ROOT)}  ({len(html):,} chars)")

    checklist_path = OUT_DIR / "REGISTRATION_CHECKLIST.md"
    checklist_path.write_text(REGISTRATION_CHECKLIST, encoding="utf-8")
    print(f"  ✓ Wrote {checklist_path.relative_to(ROOT)}")

    print()
    print("─" * 70)
    print(f"Treatment generated.")
    print(f"  Title:          {meta['title']}")
    print(f"  Author:         {meta['author']['name']} (SWA #{meta['author']['swa_member_no']})")
    print(f"  Total chapters: {len(chapters)} ({sum(1 for c in chapters if isinstance(c.number, int))} chapters + epilogue)")
    print(f"  Content SHA256: {content_hash}")
    print()
    print(f"Next step:")
    print(f"  1. Open treatment/THE_PRESIDENTS_RULE_TREATMENT.html in a browser")
    print(f"  2. File → Print → Save as PDF")
    print(f"  3. Follow treatment/REGISTRATION_CHECKLIST.md for SWA + WGAW filing")
    return 0


if __name__ == "__main__":
    sys.exit(main())
