const fs = require('fs');
const path = require('path');

const MANUSCRIPT_PATH = path.resolve(__dirname, '../manuscripts/The_Presidents_Rule_Master_Narrative.md');

function chapterIdFor(label) {
  const lower = label.toLowerCase().trim();
  if (lower.startsWith('epilogue')) return 'CH_EPILOGUE';
  if (lower.startsWith('prologue')) return 'CH_00_PROLOGUE';
  const m = lower.match(/chapter\s+(\d+)/);
  if (m) return 'CH_' + String(+m[1]).padStart(2, '0');
  return null;
}

function chapterNumberFor(label) {
  const lower = label.toLowerCase().trim();
  if (lower.startsWith('epilogue')) return 25;
  if (lower.startsWith('prologue')) return 0;
  const m = lower.match(/chapter\s+(\d+)/);
  if (m) return +m[1];
  return -1;
}

function parseChapterBlock(headerLine, bodyLines) {
  // headerLine: "## Chapter 2 — Delhi Gambit"  OR  "## Epilogue — What the Patient Does Next"
  const headerMatch = headerLine.match(/^##\s+(.+?)(?:\s+[—–-]\s+(.+))?$/);
  if (!headerMatch) return null;
  const labelPart = headerMatch[1].trim();
  const titlePart = (headerMatch[2] || '').trim();

  const chapterId = chapterIdFor(labelPart);
  const chapterNumber = chapterNumberFor(labelPart);
  if (!chapterId) return null;

  const uniqueDetails = [];
  const proseLines = [];
  let keyInsight = '';
  let inUniqueBlock = false;
  let uniqueHeaderSeen = false;

  for (let i = 0; i < bodyLines.length; i++) {
    const raw = bodyLines[i];
    const line = raw.trimEnd();

    // start of "> **Unique Details Retained..."
    if (!uniqueHeaderSeen && /^>\s*\*\*Unique Details Retained/i.test(line)) {
      inUniqueBlock = true;
      uniqueHeaderSeen = true;
      continue;
    }
    if (inUniqueBlock) {
      if (line.startsWith('>')) {
        // bullet inside block-quote — strip the "> - " prefix
        const item = line.replace(/^>\s*[-*]\s*/, '').replace(/^>\s*/, '').trim();
        if (item) uniqueDetails.push(item);
        continue;
      } else {
        inUniqueBlock = false;
      }
    }

    // Key Insight paragraph
    if (/^\*\*Key Insight:\*\*/i.test(line)) {
      keyInsight = line.replace(/^\*\*Key Insight:\*\*\s*/i, '').trim();
      // continuation lines until blank or ---
      let j = i + 1;
      while (j < bodyLines.length) {
        const nx = bodyLines[j].trimEnd();
        if (nx === '' || nx === '---') break;
        keyInsight += ' ' + nx.trim();
        j++;
      }
      i = j;
      continue;
    }

    // Skip pure separators
    if (line === '---') continue;

    proseLines.push(raw);
  }

  // Trim leading/trailing blank lines from prose
  while (proseLines.length && proseLines[0].trim() === '') proseLines.shift();
  while (proseLines.length && proseLines[proseLines.length - 1].trim() === '') proseLines.pop();

  const fullProse = proseLines.join('\n');
  const wordCount = fullProse.split(/\s+/).filter(Boolean).length;

  return {
    chapter_id: chapterId,
    chapter_number: chapterNumber,
    chapter_title: titlePart || labelPart,
    content: {
      full_prose: fullProse,
      unique_details: uniqueDetails,
      key_insight: keyInsight,
      word_count: wordCount,
      source_file: 'The_Presidents_Rule_Master_Narrative.md'
    }
  };
}

function parseManuscript() {
  if (!fs.existsSync(MANUSCRIPT_PATH)) {
    console.warn('Master narrative not found at', MANUSCRIPT_PATH);
    return [];
  }
  const text = fs.readFileSync(MANUSCRIPT_PATH, 'utf8');
  const lines = text.split('\n');

  const chapters = [];
  let currentHeader = null;
  let currentBody = [];

  for (const line of lines) {
    const isChapterHeader = /^##\s+(Chapter|Epilogue|Prologue)\b/i.test(line);
    if (isChapterHeader) {
      if (currentHeader) {
        const ch = parseChapterBlock(currentHeader, currentBody);
        if (ch) chapters.push(ch);
      }
      currentHeader = line;
      currentBody = [];
    } else if (currentHeader) {
      currentBody.push(line);
    }
  }
  // Flush last chapter
  if (currentHeader) {
    const ch = parseChapterBlock(currentHeader, currentBody);
    if (ch) chapters.push(ch);
  }
  return chapters;
}

module.exports = { parseManuscript, MANUSCRIPT_PATH };
