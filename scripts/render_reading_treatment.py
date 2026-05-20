#!/usr/bin/env python3
"""Render treatment/READING_TREATMENT.md → print-ready HTML.

Produces a Final Draft / Celtx-style document:
    - Times New Roman 12pt
    - 1.5 line spacing
    - A4, 1" margins
    - Page numbers in header
    - Title page on its own page (centered vertically)
    - Each Act and each Appendix starts on a new page
    - Logline centered and italicized
    - No bullet points in body prose; clean paragraphs only

Usage:
    python3 scripts/render_reading_treatment.py

Open the resulting HTML in any browser, then File → Print → Save as PDF
to produce the document you send to producers, agents, and stars.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INPUT = ROOT / "treatment" / "READING_TREATMENT.md"
OUTPUT = ROOT / "treatment" / "READING_TREATMENT.html"


# ─────────────────────────────────────────────────────────────────────────────
# Minimal markdown → HTML (no external deps; only what this document uses)
# ─────────────────────────────────────────────────────────────────────────────


def inline_md(s: str) -> str:
    """Apply inline markdown: bold, italic, code."""
    # Bold first (so ** doesn't get parsed as nested italics)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    # Italic (avoid eating bolds we just emitted)
    s = re.sub(r"(?<!\w)\*([^*\n]+?)\*(?!\w)", r"<em>\1</em>", s)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    return s


def md_to_html_body(md: str) -> str:
    """Convert the READING_TREATMENT.md content to semantic HTML. Section
    classes are assigned so the CSS can place page breaks correctly."""
    lines = md.splitlines()
    html: list[str] = []

    # Wrap the whole thing in semantic sections using sentinels in the source.
    # We open a div with a specific class when we see a known heading.
    section_open = False

    def close_section():
        nonlocal section_open
        if section_open:
            html.append("</section>")
            section_open = False

    def open_section(klass: str):
        nonlocal section_open
        close_section()
        html.append(f'<section class="{klass}">')
        section_open = True

    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # ── Title page (first H1)
        if stripped.startswith("# "):
            title = inline_md(stripped[2:])
            # Title page wrapper — collect the next several non-empty lines
            # before the first `---` as the title-page block content.
            open_section("title-page")
            html.append(f'<h1 class="title">{title}</h1>')
            # consume following lines until the first horizontal rule
            i += 1
            tp_lines: list[str] = []
            while i < len(lines) and lines[i].strip() != "---":
                if lines[i].strip():
                    tp_lines.append(lines[i].strip())
                i += 1
            # Render the title-page meta block. First non-empty line is the
            # subtitle ("A Treatment"); the rest go beneath as author info.
            if tp_lines:
                html.append(f'<p class="title-form">{inline_md(tp_lines[0])}</p>')
                for tl in tp_lines[1:]:
                    html.append(f'<p class="title-meta">{inline_md(tl)}</p>')
            close_section()
            # consume the closing ---
            i += 1
            continue

        # ── H2: top-level section header (Logline / The Treatment / Principal Characters / Research Appendices)
        if stripped.startswith("## "):
            text = stripped[3:]
            slug = _slug(text)
            klass_map = {
                "logline": "section-logline",
                "the-treatment": "section-treatment",
                "principal-characters": "section-characters",
                "research-appendices": "section-research-intro",
            }
            klass = klass_map.get(slug, "section-misc")
            open_section(klass)
            html.append(f'<h2 class="section-h2">{inline_md(text)}</h2>')
            i += 1
            continue

        # ── H3: Acts within "The Treatment" OR appendices
        if stripped.startswith("### "):
            text = stripped[4:]
            slug = _slug(text)
            # Each Act and each Appendix is its own section (own page break)
            if slug.startswith("act-") or slug.startswith("appendix-"):
                klass = "section-act" if slug.startswith("act-") else "section-appendix"
                open_section(klass)
                html.append(f'<h3 class="section-h3">{inline_md(text)}</h3>')
            else:
                html.append(f'<h3 class="section-h3">{inline_md(text)}</h3>')
            i += 1
            continue

        if stripped == "---":
            i += 1
            continue

        if stripped == "":
            html.append("")
            i += 1
            continue

        # Plain paragraph
        html.append(f"<p>{inline_md(stripped)}</p>")
        i += 1

    close_section()
    return "\n".join(html)


def _slug(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s


# ─────────────────────────────────────────────────────────────────────────────
# CSS — Final Draft / Celtx aesthetic for a reading treatment
# ─────────────────────────────────────────────────────────────────────────────


CSS = """
@page {
  size: A4;
  margin: 25mm 22mm 25mm 22mm;
  @top-right {
    content: counter(page);
    font-family: 'Times New Roman', Times, serif;
    font-size: 10pt;
    color: #555;
  }
  @top-left {
    content: "THE PRESIDENT'S RULE — Treatment";
    font-family: 'Times New Roman', Times, serif;
    font-size: 9pt;
    color: #777;
    letter-spacing: 0.5px;
  }
}
@page :first {
  /* Title page: hide the running header */
  @top-right { content: ""; }
  @top-left { content: ""; }
}

* { box-sizing: border-box; }

html, body {
  font-family: 'Times New Roman', Times, 'Liberation Serif', serif;
  font-size: 12pt;
  line-height: 1.5;
  color: #111;
  background: #fafafa;
}

body {
  max-width: 760px;
  margin: 0 auto;
  padding: 40px 50px 60px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

@media print {
  body { max-width: none; padding: 0; box-shadow: none; background: #fff; }
}

/* ── Title page ─────────────────────────────────────────────────────────── */
section.title-page {
  page-break-after: always;
  min-height: 85vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}
h1.title {
  font-size: 28pt;
  font-weight: bold;
  letter-spacing: 4px;
  margin: 0 0 36px;
  text-transform: uppercase;
}
p.title-form {
  font-size: 16pt;
  font-style: italic;
  margin: 0 0 80px;
  color: #333;
}
p.title-meta {
  font-size: 12pt;
  margin: 6px 0;
  color: #333;
  line-height: 1.4;
}

/* ── Section headers ─────────────────────────────────────────────────────── */
h2.section-h2 {
  font-size: 16pt;
  font-weight: bold;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 3px;
  margin: 0 0 36px;
  page-break-after: avoid;
}

h3.section-h3 {
  font-size: 13pt;
  font-weight: bold;
  margin: 0 0 24px;
  text-align: center;
  letter-spacing: 1px;
  page-break-after: avoid;
}

/* ── Logline ────────────────────────────────────────────────────────────── */
section.section-logline {
  page-break-after: always;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
section.section-logline p {
  font-style: italic;
  font-size: 14pt;
  line-height: 1.7;
  text-align: center;
  max-width: 540px;
  margin: 0 auto;
  color: #1a1a1a;
}

/* ── The Treatment + Acts ───────────────────────────────────────────────── */
section.section-treatment {
  page-break-before: always;
}
section.section-act {
  page-break-before: always;
  padding-top: 12mm;
}
section.section-act h3.section-h3 {
  font-size: 14pt;
  margin-bottom: 32px;
  letter-spacing: 2px;
}

/* Drop cap on the first paragraph of each Act for cinematic feel */
section.section-act > p:first-of-type::first-letter {
  font-size: 38pt;
  font-weight: bold;
  float: left;
  line-height: 0.9;
  padding-right: 8px;
  padding-top: 4px;
  color: #1a1a1a;
}

/* ── Characters ─────────────────────────────────────────────────────────── */
section.section-characters {
  page-break-before: always;
  padding-top: 8mm;
}
section.section-characters p {
  margin-bottom: 16px;
  text-indent: 0;
}

/* ── Research Appendices intro and per-appendix pages ───────────────────── */
section.section-research-intro {
  page-break-before: always;
  padding-top: 8mm;
}
section.section-research-intro p {
  font-style: italic;
  color: #333;
  text-align: center;
  max-width: 560px;
  margin: 0 auto 24px;
}
section.section-appendix {
  page-break-before: always;
  padding-top: 8mm;
}
section.section-appendix h3.section-h3 {
  text-align: left;
  font-size: 14pt;
  border-bottom: 1.5px solid #111;
  padding-bottom: 8px;
  margin-bottom: 22px;
  letter-spacing: 0.5px;
}

/* ── Body paragraphs ────────────────────────────────────────────────────── */
p {
  margin: 0 0 14px;
  text-align: justify;
  text-justify: inter-word;
  hyphens: auto;
}

em { font-style: italic; }
strong { font-weight: bold; }
code { font-family: 'Courier New', monospace; font-size: 11pt; }

/* The very last line — "End of Treatment." */
p em:only-child {
  display: block;
  text-align: center;
  margin-top: 40px;
  font-size: 11pt;
  color: #666;
}
"""


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────


def main() -> int:
    if not INPUT.exists():
        print(f"ERROR: {INPUT} not found.", file=sys.stderr)
        return 1

    md = INPUT.read_text(encoding="utf-8")
    body = md_to_html_body(md)

    html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>The President's Rule — Treatment</title>
<style>{CSS}</style>
</head>
<body>
{body}
</body>
</html>
"""

    OUTPUT.write_text(html, encoding="utf-8")

    # Quick stats
    word_count = len(re.findall(r"\b\w+\b", md))
    appendix_count = md.count("### Appendix ")
    act_count = len(re.findall(r"^### Act ", md, flags=re.MULTILINE))

    print(f"  ✓ Read  {INPUT.relative_to(ROOT)}  ({word_count:,} words)")
    print(f"  ✓ Wrote {OUTPUT.relative_to(ROOT)}  ({len(html):,} chars)")
    print()
    print(f"  Acts:        {act_count}")
    print(f"  Appendices:  {appendix_count}")
    print()
    print(f"Next step:")
    print(f"  Open treatment/READING_TREATMENT.html in Chrome/Safari, then")
    print(f"  File → Print → Save as PDF (A4, default margins).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
