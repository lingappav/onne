const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { BENCHMARK_NOVELS } = require('./benchmark-data');
const { parseManuscript } = require('./chapter-parser');
const { pitchesDb, filmAgreementDb, tasksDb, planDb, activityDb, journalDb, commentsDb } = require('./db');

const app = express();
const PORT = 3001;

const MASTER_PATH  = path.resolve(__dirname, '../master_novel.json');
const VERSIONS_DIR = path.resolve(__dirname, '../novel_versions');
const INDEX_PATH   = path.join(VERSIONS_DIR, 'versions.json');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ── helpers ──────────────────────────────────────────────────────────────────

function readMaster() {
  return JSON.parse(fs.readFileSync(MASTER_PATH, 'utf8'));
}

function readIndex() {
  return JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
}

function writeIndex(index) {
  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
}

function readVersion(filename) {
  return JSON.parse(fs.readFileSync(path.join(VERSIONS_DIR, filename), 'utf8'));
}

function writeVersion(filename, data) {
  fs.writeFileSync(path.join(VERSIONS_DIR, filename), JSON.stringify(data, null, 2));
}

function nextVersionTag(index) {
  const num = index.length + 1;
  return 'v' + String(num).padStart(3, '0');
}

function makeFilename(tag) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${tag}_${ts}.json`;
}

// ── initialise on boot ───────────────────────────────────────────────────────

function init() {
  if (!fs.existsSync(VERSIONS_DIR)) fs.mkdirSync(VERSIONS_DIR, { recursive: true });
  if (!fs.existsSync(INDEX_PATH)) {
    const master = readMaster();
    const tag = 'v001';
    const filename = makeFilename(tag);
    writeVersion(filename, master);
    const entry = {
      version: tag,
      filename,
      timestamp: new Date().toISOString(),
      description: 'Initial — imported from master_novel.json',
      parent: null
    };
    writeIndex([entry]);
    console.log(`Initialised versions — created ${filename}`);
  }
}

function importChaptersIfNeeded() {
  const index = readIndex();
  if (!index.length) return;
  const latest = index[index.length - 1];
  const data = readVersion(latest.filename);
  const chapters = data.master_novel.chapters || [];

  // If at least one chapter from the manuscript range (CH_02+) has prose content, skip
  const hasImportedProse = chapters.some(c =>
    c.chapter_id !== 'CH_00_PROLOGUE' &&
    c.chapter_id !== 'CH_01' &&
    c.content && c.content.full_prose
  );
  if (hasImportedProse) return;

  const parsed = parseManuscript();
  if (!parsed.length) {
    console.warn('Chapter parser returned no chapters — skipping import.');
    return;
  }

  // Merge: for each parsed chapter, either extend the existing record or add new
  const merged = [...chapters];
  let added = 0, enriched = 0;
  for (const parsedCh of parsed) {
    const existing = merged.find(c => c.chapter_id === parsedCh.chapter_id);
    if (existing) {
      existing.content = parsedCh.content;
      // Update title to canonical from manuscript only if existing is empty/generic
      if (!existing.chapter_title || existing.chapter_title === parsedCh.chapter_id) {
        existing.chapter_title = parsedCh.chapter_title;
      }
      enriched++;
    } else {
      merged.push({
        chapter_id: parsedCh.chapter_id,
        chapter_title: parsedCh.chapter_title,
        chapter_number: parsedCh.chapter_number,
        source: {
          origin: 'manuscript_import',
          filename: 'The_Presidents_Rule_Master_Narrative.md',
          status: 'imported'
        },
        synopsis: {
          one_line: '',
          plot_summary: '',
          dramatic_summary: ''
        },
        intention: {
          narrative_purpose: '',
          emotional_target: '',
          thematic_payload: '',
          setup_elements: [],
          payoff_elements: [],
          act_position: null,
          beat_sheet_position: null,
          inferred: true,
          confidence: 'medium'
        },
        scenes: [],
        beat_patterns: {
          dominant_beat_type: '',
          emotional_arc: '',
          tension_arc: '',
          opening_hook_strength: 5,
          closing_hook_strength: 5
        },
        threads: { introduced: [], advanced: [], resolved: [] },
        content: parsedCh.content
      });
      added++;
    }
  }

  // Sort by chapter_number for cleanliness
  merged.sort((a, b) => (a.chapter_number ?? 0) - (b.chapter_number ?? 0));

  data.master_novel.chapters = merged;

  const tag = nextVersionTag(index);
  const filename = makeFilename(tag);
  writeVersion(filename, data);
  index.push({
    version: tag,
    filename,
    timestamp: new Date().toISOString(),
    description: `Imported full chapter prose from manuscripts (${added} added, ${enriched} enriched)`,
    parent: latest.version
  });
  writeIndex(index);
  console.log(`Imported chapter prose — ${added} new chapters, ${enriched} enriched. Saved as ${tag}`);
}

// ── deep diff ────────────────────────────────────────────────────────────────

function deepDiff(a, b, path = '') {
  const changes = [];
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      changes.push({ path: path || '(root)', type: 'changed', oldValue: a, newValue: b });
    }
    return changes;
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    const sa = JSON.stringify(a), sb = JSON.stringify(b);
    if (sa !== sb) {
      changes.push({ path: path || '(root)', type: 'changed', oldValue: a, newValue: b });
    }
    return changes;
  }
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    const p = path ? `${path}.${k}` : k;
    if (!(k in a)) {
      changes.push({ path: p, type: 'added', oldValue: undefined, newValue: b[k] });
    } else if (!(k in b)) {
      changes.push({ path: p, type: 'removed', oldValue: a[k], newValue: undefined });
    } else {
      changes.push(...deepDiff(a[k], b[k], p));
    }
  }
  return changes;
}

// ── version routes ───────────────────────────────────────────────────────────

// list all versions
app.get('/api/versions', (req, res) => {
  try {
    res.json(readIndex());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// get master (read-only reference)
app.get('/api/master', (req, res) => {
  try { res.json(readMaster()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// get a specific version
app.get('/api/versions/:tag', (req, res) => {
  try {
    const index = readIndex();
    const entry = index.find(e => e.version === req.params.tag);
    if (!entry) return res.status(404).json({ error: 'Version not found' });
    res.json(readVersion(entry.filename));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// save new version
app.post('/api/versions', (req, res) => {
  try {
    const { data, description, parentVersion } = req.body;
    const index = readIndex();
    const tag = nextVersionTag(index);
    const filename = makeFilename(tag);
    writeVersion(filename, data);
    const entry = {
      version: tag,
      filename,
      timestamp: new Date().toISOString(),
      description: description || 'Manual save',
      parent: parentVersion || (index.length ? index[index.length - 1].version : null)
    };
    index.push(entry);
    writeIndex(index);
    res.json({ ok: true, version: tag, entry });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// diff two versions (or master)
app.get('/api/diff', (req, res) => {
  try {
    const { v1, v2 } = req.query;
    const getContent = (v) => {
      if (v === 'master') return readMaster();
      const index = readIndex();
      const entry = index.find(e => e.version === v);
      if (!entry) throw new Error(`Version ${v} not found`);
      return readVersion(entry.filename);
    };
    const a = getContent(v1);
    const b = getContent(v2);
    const changes = deepDiff(a.master_novel, b.master_novel, 'master_novel');
    res.json({ v1, v2, totalChanges: changes.length, changes });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── convenience: get novel data for a version (or latest) ───────────────────

app.get('/api/novel', (req, res) => {
  try {
    const { version } = req.query;
    if (version && version !== 'latest') {
      const index = readIndex();
      const entry = index.find(e => e.version === version);
      if (!entry) return res.status(404).json({ error: 'Version not found' });
      return res.json(readVersion(entry.filename));
    }
    // latest
    const index = readIndex();
    if (!index.length) return res.status(404).json({ error: 'No versions' });
    const latest = index[index.length - 1];
    res.json(readVersion(latest.filename));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── section-level convenience patches (always create new version) ────────────

app.patch('/api/novel/section', (req, res) => {
  try {
    const { version, section, data, description, saveAsNew } = req.body;
    const index = readIndex();
    let base;
    if (version) {
      const entry = index.find(e => e.version === version);
      if (!entry) return res.status(404).json({ error: 'Version not found' });
      base = readVersion(entry.filename);
    } else {
      const latest = index[index.length - 1];
      base = readVersion(latest.filename);
    }
    base.master_novel[section] = data;

    const tag = nextVersionTag(index);
    const filename = makeFilename(tag);
    writeVersion(filename, base);
    const entry = {
      version: tag,
      filename,
      timestamp: new Date().toISOString(),
      description: description || `Updated ${section}`,
      parent: version || (index.length ? index[index.length - 1].version : null)
    };
    index.push(entry);
    writeIndex(index);
    res.json({ ok: true, version: tag, entry });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// character + chapter CRUD — all create new versions

function crudSave(req, res, listKey, idKey, item, description) {
  try {
    const { version } = req.query;
    const index = readIndex();
    let base;
    if (version) {
      const entry = index.find(e => e.version === version);
      if (!entry) return res.status(404).json({ error: 'Version not found' });
      base = readVersion(entry.filename);
    } else {
      const latest = index[index.length - 1];
      base = readVersion(latest.filename);
    }

    const list = base.master_novel[listKey];
    const idx = list.findIndex(x => x[idKey] === item[idKey]);
    if (idx >= 0) list[idx] = item;
    else list.push(item);

    const tag = nextVersionTag(index);
    const filename = makeFilename(tag);
    writeVersion(filename, base);
    const entry = {
      version: tag,
      filename,
      timestamp: new Date().toISOString(),
      description,
      parent: version || (index.length ? index[index.length - 1].version : null)
    };
    index.push(entry);
    writeIndex(index);
    res.json({ ok: true, version: tag, entry });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

function crudDelete(req, res, listKey, idKey, id, description) {
  try {
    const { version } = req.query;
    const index = readIndex();
    const latest = index[index.length - 1];
    const base = readVersion(latest.filename);
    base.master_novel[listKey] = base.master_novel[listKey].filter(x => x[idKey] !== id);
    const tag = nextVersionTag(index);
    const filename = makeFilename(tag);
    writeVersion(filename, base);
    index.push({ version: tag, filename, timestamp: new Date().toISOString(), description, parent: latest.version });
    writeIndex(index);
    res.json({ ok: true, version: tag });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

app.put('/api/novel/characters/:id',  (req, res) => crudSave(req, res, 'characters', 'character_id', req.body, `Updated character ${req.params.id}`));
app.post('/api/novel/characters',     (req, res) => crudSave(req, res, 'characters', 'character_id', req.body, `Added character ${req.body.character_id}`));
app.delete('/api/novel/characters/:id', (req, res) => crudDelete(req, res, 'characters', 'character_id', req.params.id, `Deleted character ${req.params.id}`));

app.put('/api/novel/chapters/:id',    (req, res) => crudSave(req, res, 'chapters', 'chapter_id', req.body, `Updated chapter ${req.params.id}`));
app.post('/api/novel/chapters',       (req, res) => crudSave(req, res, 'chapters', 'chapter_id', req.body, `Added chapter ${req.body.chapter_id}`));
app.delete('/api/novel/chapters/:id', (req, res) => crudDelete(req, res, 'chapters', 'chapter_id', req.params.id, `Deleted chapter ${req.params.id}`));

// ── chapter workshop intelligence ────────────────────────────────────────────

// Canonical titles from manuscripts/The_Presidents_Rule_Master_Narrative.md
const CHAPTER_TITLES = {
  'CH_00_PROLOGUE':'Prologue',
  'CH_01':'The Broken Compass',
  'CH_02':'Delhi Gambit',
  'CH_03':'Language and a Bad Punchline',
  'CH_04':'Digital Backlash',
  'CH_05':'Triple Agenda',
  'CH_06':'Ethical Anchor',
  'CH_07':'The High-Octane Friday',
  'CH_08':'Cash Transactions and the Shadow Economy',
  'CH_09':'Midnight Incision',
  'CH_10':'Shadow Siege',
  'CH_11':'The No Alcohol Dilemma',
  'CH_12':'The Stray Dog Dilemma',
  'CH_13':'The RIP Moment',
  'CH_14':'The Pitch Deck — Spying and Surveillance',
  'CH_15':'The Grand Arrest',
  'CH_16':"Chanakya's Theory",
  'CH_17':'Sarcastic Compliance and Confrontation',
  'CH_18':"The Last 10 Days — Jyestha's House",
  'CH_19':'No Tech Crime',
  'CH_20':'Family Dinner',
  'CH_21':"Elevation Attack — Kodagu's Pitch Deck",
  'CH_22':'Counter Attack',
  'CH_23':'The Unsolved Case',
  'CH_24':'Reset in Democracy',
  'CH_EPILOGUE':'What the Patient Does Next'
};

const CHAPTER_NUMBERS = {
  'CH_00_PROLOGUE':0,'CH_01':1,'CH_02':2,'CH_03':3,'CH_04':4,'CH_05':5,'CH_06':6,
  'CH_07':7,'CH_08':8,'CH_09':9,'CH_10':10,'CH_11':11,'CH_12':12,'CH_13':13,
  'CH_14':14,'CH_15':15,'CH_16':16,'CH_17':17,'CH_18':18,'CH_19':19,'CH_20':20,
  'CH_21':21,'CH_22':22,'CH_23':23,'CH_24':24,'CH_EPILOGUE':25
};

const ACT_MAP = {
  'CH_00_PROLOGUE':'Prologue',
  'CH_01':'Setup','CH_02':'Setup','CH_03':'Setup','CH_04':'Setup',
  'CH_05':'Setup','CH_06':'Setup','CH_07':'Setup','CH_08':'Setup',
  'CH_09':'Confrontation','CH_10':'Confrontation','CH_11':'Confrontation',
  'CH_12':'Confrontation','CH_13':'Confrontation','CH_14':'Confrontation',
  'CH_15':'Confrontation','CH_16':'Confrontation','CH_17':'Confrontation',
  'CH_18':'Resolution','CH_19':'Resolution','CH_20':'Resolution',
  'CH_21':'Resolution','CH_22':'Resolution','CH_23':'Resolution',
  'CH_24':'Resolution','CH_EPILOGUE':'Resolution'
};

const BEAT_MAP = {
  'CH_01':['Opening Image','Catalyst','Debate'],
  'CH_02':['Theme Stated','Break Into Two'],
  'CH_03':['Set-Up'],
  'CH_05':['Fun and Games (Promise of the Premise)'],
  'CH_11':['B Story'],
  'CH_13':['Midpoint'],
  'CH_14':['Bad Guys Close In'],
  'CH_17':['All Is Lost'],
  'CH_18':['Dark Night of the Soul'],
  'CH_19':['Break Into Three'],
  'CH_21':['Finale'],
  'CH_24':['Final Image']
};

// Per-chapter revision intelligence indexed by chapter ID
// Each entry: array of { dim, priority, task, benchmark_ref, score_impact }
const CHAPTER_TASKS = {
  'CH_00_PROLOGUE': [
    { dim:'protagonist_depth',   priority:'critical', score_impact:4, benchmark_ref:'Wolf Hall',
      task:'Insert the "old court case" ghost as a woven memory in the Prologue. Sampath needs a recoverable past wound — the psychological underpinning that distinguishes a literary protagonist from a moral type.' },
    { dim:'prose_craft',         priority:'high',     score_impact:3, benchmark_ref:'Train to Pakistan',
      task:'Use landscape as moral carrier — Ranchi\'s early morning sounds, the smell of the clinic. Set the register here and the reader will follow it for 300 pages.' },
    { dim:'commercial_reach',    priority:'medium',   score_impact:2, benchmark_ref:'The White Tiger',
      task:'Establish the epistolary hook or framing device clearly. The reader must understand immediately what KIND of novel this is — literary thriller, not quiet drama.' }
  ],
  'CH_01': [
    { dim:'protagonist_depth',   priority:'critical', score_impact:5, benchmark_ref:'Wolf Hall',
      task:'Weave the "old court case" backstory as a single interior thought while Sampath watches the TV announcement. This is the wound that will be exploited in Ch 17. Currently missing entirely.' },
    { dim:'prose_craft',         priority:'critical', score_impact:4, benchmark_ref:"All the King's Men",
      task:'Add an oblique narrator voice — Jack Burden\'s equivalent. Currently declarative and clean; needs the ironic slant that separates literary political fiction from competent political fiction. One paragraph of this voice changes the register of the whole novel.' },
    { dim:'narrative_tension',   priority:'high',     score_impact:3, benchmark_ref:'The Spy Who Came in from the Cold',
      task:'Extend the locked door scene — SC_01_03 already scores 10/10 philosophical tension. Add one more beat: the moment Sampath considers opening the door, then doesn\'t. The near-miss multiplies stakes.' }
  ],
  'CH_02': [
    { dim:'protagonist_depth',   priority:'critical', score_impact:4, benchmark_ref:'A Very British Coup',
      task:'Acceptance on his terms must feel like loss, not victory. Harry Perkins accepts knowing the system will destroy him. What is Sampath surrendering in this chapter? Name it explicitly in his interior life.' },
    { dim:'political_authenticity', priority:'high',  score_impact:4, benchmark_ref:'Primary Colors',
      task:'The terms of appointment need procedural specificity: which article invoked, which minister makes the call, what the timeline clause says. Political dialogue written at the speed of actual campaigns.' },
    { dim:'thematic_coherence',  priority:'medium',   score_impact:2, benchmark_ref:'Wolf Hall',
      task:'Ch 2 is the "Theme Stated" beat. Sampath\'s core moral grammar — the third choice — should be articulated without being stated. Show it through the specific terms he demands.' }
  ],
  'CH_03': [
    { dim:'political_authenticity', priority:'high',  score_impact:3, benchmark_ref:'The Insider',
      task:'The Set-Up chapter must establish Karnataka\'s political machinery with PV Narasimha Rao-level procedural accuracy: which coalition collapsed, who the key party bosses are, the specific budget crisis. Readers should feel they are reading journalism.' },
    { dim:'structural_integrity',priority:'high',     score_impact:3, benchmark_ref:'A Very British Coup',
      task:'The "Set-Up" beat should introduce ALL key players — Sampath, The Architect (off-stage), Priyadarshini, Karnataka political world — before the Catalyst fires. Currently, the antagonist is invisible in Act I.' }
  ],
  'CH_05': [
    { dim:'commercial_reach',    priority:'high',     score_impact:4, benchmark_ref:'Primary Colors',
      task:'"Fun and Games" beat is where the novel proves its promise. Show Sampath\'s competence in a sequence that is entertaining AND politically meaningful — a single day of administrative decisions that reads like a heist.' },
    { dim:'narrative_tension',   priority:'medium',   score_impact:3, benchmark_ref:'House of Cards',
      task:'Every chapter needs a manipulation or counter-manipulation. What political trap is being set in Ch 5 that won\'t spring until Ch 10? Plant the audio clip setup here.' }
  ],
  'CH_06': [
    { dim:'protagonist_depth',   priority:'high',     score_impact:3, benchmark_ref:'Wolf Hall',
      task:'"Ask for the bill" is listed as one of Sampath\'s key moral anchors. This moment must be fully dramatised — show the dinner, the discomfort, the decision, and what it costs him socially and politically.' },
    { dim:'political_authenticity', priority:'medium', score_impact:2, benchmark_ref:'The Insider',
      task:'Integrate the "retirement diary" established in Ch 1 — a written entry here bridges the private Sampath and the public Sampath.' }
  ],
  'CH_09': [
    { dim:'narrative_tension',   priority:'critical', score_impact:4, benchmark_ref:'The Spy Who Came in from the Cold',
      task:'Act II opens with the first ambush. Every subsequent chapter in Act II risks episodic flattening. CH_09 MUST establish a continuous through-line — a diary voice, a countdown timer, a growing physical symptom in Sampath — that threads through CH_09-CH_16.' },
    { dim:'structural_integrity',priority:'high',     score_impact:3, benchmark_ref:'A Very British Coup',
      task:'The antagonist\'s first indirect strike must be felt here. Not The Architect personally — but a newspaper article, a bureaucratic delay, a file that goes missing. The institutional machine starts moving.' }
  ],
  'CH_10': [
    { dim:'narrative_tension',   priority:'critical', score_impact:5, benchmark_ref:'The Spy Who Came in from the Cold',
      task:'The fabricated audio clip MUST be dramatised, not summarised. Show the studio, the technician, the WhatsApp group cascading. This is the single highest-leverage unwritten scene in the novel — every reader who reads a summary is a reader lost.' },
    { dim:'antagonist_strength', priority:'critical', score_impact:6, benchmark_ref:'A Very British Coup',
      task:'The Architect\'s fingerprint must first appear here. An email address, a budget line, a signature on the studio contract — something that Sampath won\'t understand until Ch 17 but the reader will recognise in retrospect.' }
  ],
  'CH_11': [
    { dim:'antagonist_strength', priority:'critical', score_impact:7, benchmark_ref:'House of Cards',
      task:'The Architect MUST appear in this chapter — even once, even briefly. This is the B Story beat. Without an antagonist with a face, the threat is abstract. A single scene: a phone call overheard, a face at the back of a meeting, a name on a document. House of Cards: Urquhart appears every chapter because absence of a named antagonist collapses tension.' },
    { dim:'emotional_resonance', priority:'high',     score_impact:3, benchmark_ref:'A Very British Coup',
      task:'B Story beat = personal story. Add a Priyadarshini phone call during the siege. Her voice on the line while the political crisis unfolds is the cost in human form. This scene will pay off enormously in Ch 20.' }
  ],
  'CH_12': [
    { dim:'narrative_tension',   priority:'high',     score_impact:3, benchmark_ref:'The Spy Who Came in from the Cold',
      task:'Act II chapters must escalate the SAME QUESTION across each chapter — is Sampath\'s method enough? Ch 12 should raise a new doubt that is qualitatively different from Ch 11\'s.' },
    { dim:'political_authenticity', priority:'medium', score_impact:2, benchmark_ref:'Primary Colors',
      task:'Show the bureaucratic siege with insider texture — which department delays, which files go missing, which official stops returning calls. Make the reader feel the machinery.' }
  ],
  'CH_13': [
    { dim:'antagonist_strength', priority:'critical', score_impact:5, benchmark_ref:'A Very British Coup',
      task:'The RIP rally + Kodagu flood is your best Act II set-piece. The Architect should be the unseen orchestrator of the rally. One detail plants this: a rally funder whose name will recur, a logistics email, a timing that is too perfect.' },
    { dim:'narrative_tension',   priority:'critical', score_impact:4, benchmark_ref:'House of Cards',
      task:'The Midpoint beat demands Sampath crosses a point of no return. The simultaneous crises are correct structurally — but the CHOICE he makes here must cost him something that cannot be recovered.' }
  ],
  'CH_14': [
    { dim:'antagonist_strength', priority:'high',     score_impact:4, benchmark_ref:'House of Cards',
      task:'"Bad Guys Close In" beat. The Architect should appear or be named for the second time. The net should visibly tighten — not just through events but through The Architect\'s deliberate, intelligent choices.' },
    { dim:'narrative_tension',   priority:'high',     score_impact:3, benchmark_ref:'The Spy Who Came in from the Cold',
      task:'The reader should now know that Sampath is going to lose before he knows it. Le Carré\'s technique: show the trap being set while showing the protagonist walking toward it.' }
  ],
  'CH_15': [
    { dim:'structural_integrity',priority:'high',     score_impact:3, benchmark_ref:'A Very British Coup',
      task:'Ch 15 is the penultimate Act II chapter before All Is Lost. The protagonist\'s last attempt to stop the collapse must feel genuinely possible — false hope at maximum credibility.' },
    { dim:'narrative_tension',   priority:'medium',   score_impact:2, benchmark_ref:'Primary Colors',
      task:'Political dialogue here should be at its most tactical — Sampath is negotiating, not just resisting. Show his political intelligence at its peak before it is outmatched.' }
  ],
  'CH_16': [
    { dim:'structural_integrity',priority:'high',     score_impact:3, benchmark_ref:'The Spy Who Came in from the Cold',
      task:'The final chapter before All Is Lost. The structural move: take the one resource Sampath thought he had and remove it. Do this without announcement — show the door closing quietly.' },
    { dim:'narrative_tension',   priority:'high',     score_impact:3, benchmark_ref:'A Very British Coup',
      task:'By the end of Ch 16, the reader should be certain Sampath will lose. The dramatic question shifts from "will he win" to "how will he lose, and what will he preserve."' }
  ],
  'CH_17': [
    { dim:'antagonist_strength', priority:'critical', score_impact:8, benchmark_ref:'House of Cards',
      task:'The Architect confrontation is your All Is Lost beat — the only time The Architect appears. This scene carries the entire weight of antagonist characterisation for the whole novel. SOLUTION: Add CH_10 and CH_13 Architect fingerprints first, so this becomes the meeting of two known forces rather than a first introduction. Currently this scene is doing the work of three chapters.' },
    { dim:'protagonist_depth',   priority:'critical', score_impact:5, benchmark_ref:'Wolf Hall',
      task:'Integrate the "old court case" into this confrontation. The Architect uses Sampath\'s past as leverage. The wound established in Ch 1 is weaponised here. This is the turning point that requires the setup.' },
    { dim:'prose_craft',         priority:'high',     score_impact:3, benchmark_ref:'Wolf Hall',
      task:'The Architect\'s dialogue should be oblique — what he does not say carries more weight than what he says. Mantel\'s technique: silence and implication over declaration.' }
  ],
  'CH_18': [
    { dim:'emotional_resonance', priority:'critical', score_impact:5, benchmark_ref:'Train to Pakistan',
      task:'Dark Night of the Soul. Jyestha\'s house must shift register — slower, more interior, poetic. Use Khushwant Singh\'s technique: landscape carries the moral weight the characters cannot articulate. What does the house smell like? What is not said over dinner?' },
    { dim:'prose_craft',         priority:'high',     score_impact:4, benchmark_ref:'Wolf Hall',
      task:'This is the chapter where prose quality should visibly change — away from procedural, toward interior. One paragraph of pure sensory interior monologue here will be quoted in every review.' },
    { dim:'protagonist_depth',   priority:'high',     score_impact:3, benchmark_ref:"All the King's Men",
      task:'What does Sampath admit to himself here that he cannot admit anywhere else? The Dark Night requires private truth — the thing the protagonist has been avoiding since Chapter 1.' }
  ],
  'CH_19': [
    { dim:'structural_integrity',priority:'high',     score_impact:3, benchmark_ref:'A Very British Coup',
      task:'"Break Into Three" beat. Sampath\'s decision to act must come from CHARACTER, not plot logic. What in his specific history, wounds, and values drives this specific choice? The third choice returns here.' },
    { dim:'protagonist_depth',   priority:'high',     score_impact:3, benchmark_ref:'The Spy Who Came in from the Cold',
      task:'This is Sampath\'s equivalent of Leamas\'s final decision. He knows what it will cost. He chooses anyway. Show the cost first; make the choice feel earned, not heroic.' }
  ],
  'CH_20': [
    { dim:'emotional_resonance', priority:'critical', score_impact:6, benchmark_ref:'Wolf Hall',
      task:'Priyadarshini\'s weight-bearing line currently carries more than it can support because she has barely appeared. With a Ch 11 phone call added, THIS chapter becomes devastating. Without it, it is surprise — not catharsis. The single highest-leverage earlier scene for emotional resonance payoff.' },
    { dim:'protagonist_depth',   priority:'high',     score_impact:4, benchmark_ref:'A Very British Coup',
      task:'Sampath\'s response to Priyadarshini should unlock the thing we have suspected since Ch 1 — the real cost he knew he was choosing when he stood before the locked door.' }
  ],
  'CH_21': [
    { dim:'political_authenticity', priority:'critical', score_impact:5, benchmark_ref:'The Insider',
      task:'Ordering public disclosure of names is the Finale beat. The procedural specificity here must be maximum — which law, which court, which precedent, what the RTI pages actually contain. This must read like it could have happened.' },
    { dim:'protagonist_depth',   priority:'high',     score_impact:3, benchmark_ref:"All the King's Men",
      task:'The Finale\'s moral weight requires acknowledging what Sampath is destroying as well as what he is building. Who gets hurt by the disclosure? Name them. Make the choice tragic as well as right.' },
    { dim:'commercial_reach',    priority:'medium',   score_impact:3, benchmark_ref:'Primary Colors',
      task:'The disclosure scene is your most cinematic moment. Write it as scene, not summary. Dialogue at the speed of crisis. This is the scene that will be adapted.' }
  ],
  'CH_22': [
    { dim:'narrative_tension',   priority:'medium',   score_impact:2, benchmark_ref:'A Very British Coup',
      task:'Post-disclosure: the system\'s response must feel procedurally real — legal threats, media spin, bureaucratic counter-moves. The antagonist loses the battle but may win the war.' },
    { dim:'structural_integrity',priority:'medium',   score_impact:2, benchmark_ref:'House of Cards',
      task:'Resolution chapters must pay off every thread opened in Acts I and II. Map which threads are closed here: Prabhakar\'s file, the audio clip, the Kodagu scheme.' }
  ],
  'CH_23': [
    { dim:'emotional_resonance', priority:'high',     score_impact:4, benchmark_ref:'Primary Colors',
      task:'Prabhakar carries enormous symbolic weight but is entirely off-page. Add one fragment here — his last memo, a witness account, one paragraph from the file Sampath reads. Secondary characters who never speak on the page can be made present through documents.' },
    { dim:'protagonist_depth',   priority:'medium',   score_impact:2, benchmark_ref:'Wolf Hall',
      task:'Sampath reading Prabhakar\'s file should tell us as much about Sampath as about Prabhakar. Mirror structure: the man Sampath might have been.' }
  ],
  'CH_24': [
    { dim:'emotional_resonance', priority:'high',     score_impact:4, benchmark_ref:'Train to Pakistan',
      task:'The chai vendor scene is already listed as one of your best. Extend it: what does the vendor\'s ordinary speech reveal about what Sampath\'s year actually changed? Not policy — human texture.' },
    { dim:'commercial_reach',    priority:'high',     score_impact:4, benchmark_ref:'The White Tiger',
      task:'Final Image beat. Close with a single image that is both small and enormous — the equivalent of Balram\'s "a handful of men" ending. Something that will travel on social media when the novel is reviewed.' }
  ],
  'CH_EPILOGUE': [
    { dim:'commercial_reach',    priority:'critical', score_impact:5, benchmark_ref:'The White Tiger',
      task:'The modesty of "students eating warm food twice a week" is thematically perfect but needs ONE image of scale to land commercially — a number, a statistic, the one thing that changed that could not have changed without Sampath\'s year.' },
    { dim:'emotional_resonance', priority:'high',     score_impact:4, benchmark_ref:"All the King's Men",
      task:'The final image must echo Ch 1\'s locked door — a visual callback that closes the structural loop. The "third choice" returns in a new form: not a door refused, but a door that stands open.' },
    { dim:'protagonist_depth',   priority:'medium',   score_impact:2, benchmark_ref:'A Very British Coup',
      task:'Unlike Harry Perkins who is destroyed by the system, Sampath exits. Show what that survival costs — is he diminished, clarified, or changed in a way he did not anticipate?' }
  ]
};

// Default tasks for chapters with no specific entry (Act II chapters mostly)
function defaultTasks(chapterId, act) {
  if (act === 'Confrontation') {
    return [
      { dim:'narrative_tension', priority:'high', score_impact:3, benchmark_ref:'The Spy Who Came in from the Cold',
        task:'Act II chapter: avoid episodic crisis-response pattern. Thread a continuous through-line (diary voice, physical symptom, countdown) across ALL Act II chapters. Each chapter must escalate the same central question differently.' },
      { dim:'antagonist_strength', priority:'high', score_impact:3, benchmark_ref:'House of Cards',
        task:'The Architect\'s presence must be felt even in chapters where he does not appear. A missing file, an official who goes quiet, a budget line with his signature — institutional antagonism, never singular.' },
      { dim:'structural_integrity', priority:'medium', score_impact:2, benchmark_ref:'A Very British Coup',
        task:'Each Act II chapter should advance BOTH the plot crisis AND the internal character question. One without the other creates the episodic flatness identified in the craft assessment.' }
    ];
  }
  return [
    { dim:'prose_craft', priority:'medium', score_impact:2, benchmark_ref:'Wolf Hall',
      task:'Ensure this chapter has a distinctive opening and closing line. The reader should be able to quote a sentence from every chapter of a literary novel.' },
    { dim:'thematic_coherence', priority:'medium', score_impact:2, benchmark_ref:"All the King's Men",
      task:'The medical-political metaphor should surface at least once per chapter — not forced, but present. It is the load-bearing image that unifies the novel.' }
  ];
}

function chapterHealthScore(ch) {
  if (!ch) return 0;
  let score = 0;
  if (ch.synopsis?.plot_summary) score += 20;
  if (ch.synopsis?.dramatic_summary) score += 10;
  if (ch.intention?.narrative_purpose) score += 15;
  if (ch.intention?.emotional_target) score += 10;
  if (ch.intention?.thematic_payload) score += 10;
  if (ch.scenes?.length > 0) score += 15;
  if (ch.scenes?.[0]?.opening_line) score += 10;
  if (ch.beat_patterns?.emotional_arc) score += 5;
  if (ch.threads?.introduced?.length > 0) score += 5;
  return Math.min(score, 100);
}

app.get('/api/chapter-workshop/:chapterId', (req, res) => {
  try {
    const { chapterId } = req.params;
    const { version } = req.query;
    const index = readIndex();
    let novelData;
    if (version && version !== 'latest') {
      const entry = index.find(e => e.version === version);
      if (!entry) return res.status(404).json({ error: 'Version not found' });
      novelData = readVersion(entry.filename);
    } else {
      novelData = readVersion(index[index.length - 1].filename);
    }
    const novel = novelData.master_novel;

    // Get chapter data (or null for unwritten chapters)
    const chapter = novel.chapters.find(c => c.chapter_id === chapterId) || null;

    // Build all-chapter list for dropdown
    const allChapterIds = [
      'CH_00_PROLOGUE',
      ...['CH_01','CH_02','CH_03','CH_04','CH_05','CH_06','CH_07','CH_08'],
      ...['CH_09','CH_10','CH_11','CH_12','CH_13','CH_14','CH_15','CH_16','CH_17'],
      ...['CH_18','CH_19','CH_20','CH_21','CH_22','CH_23','CH_24','CH_EPILOGUE']
    ];
    const allChapters = allChapterIds.map(id => {
      const full = novel.chapters.find(c => c.chapter_id === id);
      return {
        chapter_id: id,
        chapter_number: full?.chapter_number ?? CHAPTER_NUMBERS[id] ?? 0,
        chapter_title: full?.chapter_title ?? CHAPTER_TITLES[id] ?? id,
        act: ACT_MAP[id] || 'Unknown',
        beats: BEAT_MAP[id] || [],
        is_drafted: !!full
      };
    });

    // Get TPR dimension scores
    const tprDims = extractTPRDimensions(novel);

    // Get revision tasks for this chapter
    const act = ACT_MAP[chapterId] || 'Unknown';
    const tasks = CHAPTER_TASKS[chapterId] || defaultTasks(chapterId, act);

    // Build dimension impact list
    const affectedDims = [...new Set(tasks.map(t => t.dim))];
    const dimensionImpacts = affectedDims.map(dim => {
      const benchScores = BENCHMARK_NOVELS.map(b => b.dimensions[dim]);
      const avg = benchScores.reduce((s, v) => s + v, 0) / benchScores.length;
      const current = tprDims[dim];
      const dimTasks = tasks.filter(t => t.dim === dim);
      const totalImpact = dimTasks.reduce((s, t) => s + t.score_impact, 0);
      const projected = Math.min(100, current + totalImpact);
      const maxScore = Math.max(...benchScores);
      return {
        dimension: dim,
        current_score: current,
        projected_score: projected,
        benchmark_avg: Math.round(avg * 10) / 10,
        benchmark_max: maxScore,
        gap_from_avg: Math.round((avg - current) * 10) / 10,
        chapter_impact_pts: totalImpact,
        priority: dimTasks.sort((a,b) => ['critical','high','medium'].indexOf(a.priority) - ['critical','high','medium'].indexOf(b.priority))[0]?.priority || 'medium'
      };
    }).sort((a,b) => b.gap_from_avg - a.gap_from_avg);

    // Continuity issues for this chapter
    const cr = novel.continuity_report || {};
    const continuityIssues = [
      ...(cr.inconsistencies || []).filter(i => i.chapter_a === chapterId || i.chapter_b === chapterId),
      ...(cr.dangling_threads || []).filter(d => d.chapter_introduced === chapterId),
      ...(cr.narrative_gaps || []).filter(g => g.chapter_id === chapterId || g.affects_chapter === chapterId)
    ];

    // What-would-elevate items relevant to this chapter
    const elevationNotes = (novel.craft_assessment?.award_potential?.what_would_elevate_it || [])
      .filter(note => {
        const n = note.toLowerCase();
        if (chapterId === 'CH_01' || chapterId === 'CH_00_PROLOGUE') return n.includes('court case') || n.includes('prologue');
        if (chapterId === 'CH_17') return n.includes('architect') || n.includes('flashback');
        if (chapterId === 'CH_11' || chapterId === 'CH_20') return n.includes('priyadarshini');
        if (chapterId === 'CH_10') return n.includes('audio');
        if (chapterId === 'CH_23') return n.includes('prabhakar');
        return false;
      });

    res.json({
      chapter,
      chapter_id: chapterId,
      chapter_title: chapter?.chapter_title ?? CHAPTER_TITLES[chapterId] ?? chapterId,
      chapter_number: chapter?.chapter_number ?? CHAPTER_NUMBERS[chapterId] ?? 0,
      act,
      beats: BEAT_MAP[chapterId] || [],
      is_drafted: !!chapter,
      health_score: chapterHealthScore(chapter),
      all_chapters: allChapters,
      intelligence: {
        dimension_impacts: dimensionImpacts,
        revision_tasks: tasks,
        continuity_issues: continuityIssues,
        elevation_notes: elevationNotes
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// ── benchmark algorithms ──────────────────────────────────────────────────────

const DIM_KEYS = [
  'protagonist_depth','antagonist_strength','thematic_coherence','prose_craft',
  'structural_integrity','political_authenticity','narrative_tension',
  'emotional_resonance','originality','commercial_reach'
];

const ALGO_WEIGHTS = {
  publisher: { prose_craft:0.22, thematic_coherence:0.18, protagonist_depth:0.15, originality:0.15, emotional_resonance:0.12, commercial_reach:0.10, narrative_tension:0.08 },
  netflix:   { narrative_tension:0.22, emotional_resonance:0.20, protagonist_depth:0.18, commercial_reach:0.18, antagonist_strength:0.12, originality:0.10 },
  studio:    { commercial_reach:0.25, narrative_tension:0.22, protagonist_depth:0.18, antagonist_strength:0.18, emotional_resonance:0.10, structural_integrity:0.07 },
  awards:    { prose_craft:0.25, thematic_coherence:0.22, originality:0.18, protagonist_depth:0.15, emotional_resonance:0.12, political_authenticity:0.08 },
  streaming: { narrative_tension:0.20, commercial_reach:0.20, protagonist_depth:0.18, antagonist_strength:0.15, emotional_resonance:0.15, structural_integrity:0.12 }
};

const ALGO_DESCRIPTIONS = {
  publisher: 'Publisher Acquisition Score — models how major literary publishers (PRH, HarperCollins, Bloomsbury) evaluate manuscripts. Weights prose craft and thematic depth highest.',
  netflix:   "Netflix Story Genome Score — models Netflix's content acquisition algorithm. Weights emotional resonance, tension, and commercial appeal.",
  studio:    'Hollywood Studio Score — models major studio adaptation potential (Universal, Paramount, A24). Weights commercial reach and protagonist–antagonist conflict.',
  awards:    'Awards Prediction Score — models Booker/Pulitzer/JCB committee selection. Weights literary craft and originality highest.',
  streaming: 'Streaming Adaptation Index — models overall OTT platform acquisition likelihood (Netflix, HBO, Apple TV+, Prime). Balances all narrative factors.'
};

function extractTPRDimensions(novel) {
  const d = (novel.craft_assessment?.sudowrite_benchmark?.dimensions) || {};
  return {
    protagonist_depth:      d.character_depth      || 71,
    antagonist_strength:    65,
    thematic_coherence:     d.thematic_coherence   || 88,
    prose_craft:            d.prose_quality         || 79,
    structural_integrity:   Math.round(((d.structural_integrity || 82) + (d.pacing_and_rhythm || 68)) / 2),
    political_authenticity: Math.round(((d.world_building || 80) + (d.dialogue_authenticity || 82)) / 2),
    narrative_tension:      d.narrative_tension     || 72,
    emotional_resonance:    d.emotional_impact      || 76,
    originality:            d.originality           || 85,
    commercial_reach:       72
  };
}

function algoScore(dims, weights) {
  return Math.round(Object.entries(weights).reduce((s, [k, w]) => s + (dims[k] || 0) * w, 0));
}

function allAlgoScores(dims) {
  return {
    publisher: algoScore(dims, ALGO_WEIGHTS.publisher),
    netflix:   algoScore(dims, ALGO_WEIGHTS.netflix),
    studio:    algoScore(dims, ALGO_WEIGHTS.studio),
    awards:    algoScore(dims, ALGO_WEIGHTS.awards),
    streaming: algoScore(dims, ALGO_WEIGHTS.streaming)
  };
}

function buildInsights(tprDims) {
  return DIM_KEYS.map(key => {
    const benchScores = BENCHMARK_NOVELS.map(b => b.dimensions[key]);
    const avg = benchScores.reduce((s, v) => s + v, 0) / benchScores.length;
    const max = Math.max(...benchScores);
    const bestIdx = benchScores.indexOf(max);
    const tpr = tprDims[key];
    const gap = avg - tpr;
    let status;
    if (tpr >= avg + 3)    status = 'strength';
    else if (tpr >= avg - 3) status = 'competitive';
    else if (gap < 10)     status = 'minor_gap';
    else if (gap < 20)     status = 'significant_gap';
    else                   status = 'critical_gap';
    return {
      dimension: key,
      tpr_score: tpr,
      benchmark_avg: Math.round(avg * 10) / 10,
      benchmark_max: max,
      best_novel: BENCHMARK_NOVELS[bestIdx].title,
      gap_from_avg: Math.round(gap * 10) / 10,
      gap_from_max: max - tpr,
      status,
      craft_note: BENCHMARK_NOVELS[bestIdx].craft_gap_vs_tpr
    };
  }).sort((a, b) => b.gap_from_avg - a.gap_from_avg);
}

app.get('/api/benchmark/analysis', (req, res) => {
  try {
    const { version } = req.query;
    const index = readIndex();
    let novelData;
    if (version && version !== 'latest') {
      const entry = index.find(e => e.version === version);
      if (!entry) return res.status(404).json({ error: 'Version not found' });
      novelData = readVersion(entry.filename);
    } else {
      const latest = index[index.length - 1];
      novelData = readVersion(latest.filename);
    }
    const novel = novelData.master_novel;
    const tprDims  = extractTPRDimensions(novel);
    const tprAlgos = allAlgoScores(tprDims);

    const dimStats = {};
    for (const k of DIM_KEYS) {
      const scores = BENCHMARK_NOVELS.map(b => b.dimensions[k]);
      dimStats[k] = {
        avg: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length * 10) / 10,
        max: Math.max(...scores),
        min: Math.min(...scores)
      };
    }

    const benchmarks = BENCHMARK_NOVELS.map(b => ({
      id: b.id, title: b.title, author: b.author, year: b.year,
      genre: b.genre, why_compared: b.why_compared,
      craft_gap_vs_tpr: b.craft_gap_vs_tpr,
      notable_craft: b.notable_craft,
      streaming_greenlights: b.streaming_greenlights,
      adaptation_note: b.adaptation_note,
      dimensions: b.dimensions,
      algo_scores: allAlgoScores(b.dimensions)
    }));

    res.json({
      tpr: {
        title: novel.metadata?.title || "The President's Rule",
        author: novel.metadata?.author?.name || 'Vishwa Shambhulingappa',
        overall_score: novel.craft_assessment?.sudowrite_benchmark?.score_out_of_100 || 78,
        tier: novel.craft_assessment?.sudowrite_benchmark?.overall_tier || 'Accomplished',
        dimensions: tprDims,
        algo_scores: tprAlgos
      },
      benchmarks,
      dim_stats: dimStats,
      insights: buildInsights(tprDims),
      algo_weights: ALGO_WEIGHTS,
      algo_descriptions: ALGO_DESCRIPTIONS
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// ── PITCH STATUS endpoints ────────────────────────────────────────────────────

app.get('/api/pitch-status', (req, res) => {
  pitchesDb.find({}, (err, docs) => {
    if (err) return res.status(500).json({ error: err.message });
    const summary     = docs.find(d => d._id === 'summary') || {};
    const publishers  = docs.filter(d => d.type === 'publisher');
    const agents      = docs.filter(d => d.type === 'agent');
    const fundraise   = docs.filter(d => d.type === 'fundraise');
    const suggested   = docs.filter(d => d.type === 'suggested');
    res.json({ summary, publishers, agents, fundraise, suggested });
  });
});

app.patch('/api/pitch-status/:id', (req, res) => {
  const id = req.params.id;
  pitchesDb.update({ _id: id }, { $set: req.body }, {}, (err, n) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: n });
  });
});

app.patch('/api/pitch-status/summary/update', (req, res) => {
  pitchesDb.update({ _id: 'summary' }, { $set: { ...req.body, last_updated: new Date().toISOString() } }, { upsert: true }, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

// ── FILM AGREEMENT endpoints ──────────────────────────────────────────────────

app.get('/api/film-agreement', (req, res) => {
  filmAgreementDb.findOne({ _id: 'film_agreement' }, (err, doc) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(doc || {});
  });
});

app.patch('/api/film-agreement', (req, res) => {
  filmAgreementDb.update({ _id: 'film_agreement' }, { $set: { ...req.body, last_updated: new Date().toISOString() } }, { upsert: true }, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

// milestone update
app.patch('/api/film-agreement/milestone/:index', (req, res) => {
  filmAgreementDb.findOne({ _id: 'film_agreement' }, (err, doc) => {
    if (err || !doc) return res.status(500).json({ error: err?.message || 'not found' });
    const milestones = doc.milestones || [];
    const idx = parseInt(req.params.index);
    if (idx < 0 || idx >= milestones.length) return res.status(400).json({ error: 'Invalid index' });
    milestones[idx] = { ...milestones[idx], ...req.body };
    filmAgreementDb.update({ _id: 'film_agreement' }, { $set: { milestones, last_updated: new Date().toISOString() } }, {}, (e) => {
      if (e) return res.status(500).json({ error: e.message });
      res.json({ ok: true, milestones });
    });
  });
});

// ── COPYWRITING TASKS endpoints ───────────────────────────────────────────────

app.get('/api/tasks', (req, res) => {
  tasksDb.find({}).sort({ order: 1 }).exec((err, docs) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(docs);
  });
});

app.post('/api/tasks', (req, res) => {
  tasksDb.count({}, (err, count) => {
    const task = { ...req.body, order: count, created: new Date().toISOString() };
    tasksDb.insert(task, (e, doc) => {
      if (e) return res.status(500).json({ error: e.message });
      res.json(doc);
    });
  });
});

app.patch('/api/tasks/:id', (req, res) => {
  tasksDb.update({ _id: req.params.id }, { $set: req.body }, {}, (err, n) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: n });
  });
});

app.delete('/api/tasks/:id', (req, res) => {
  tasksDb.remove({ _id: req.params.id }, {}, (err, n) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ removed: n });
  });
});

// reorder
app.post('/api/tasks/reorder', (req, res) => {
  const { ids } = req.body; // array of _ids in new order
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be array' });
  let pending = ids.length;
  if (!pending) return res.json({ ok: true });
  ids.forEach((id, i) => {
    tasksDb.update({ _id: id }, { $set: { order: i } }, {}, () => {
      if (--pending === 0) res.json({ ok: true });
    });
  });
});

// ── 90-DAY PLAN endpoints ─────────────────────────────────────────────────────

app.get('/api/plan90', (req, res) => {
  planDb.find({}, (err, docs) => {
    if (err) return res.status(500).json({ error: err.message });
    const meta      = docs.find(d => d._id === 'meta') || {};
    const chapters  = docs.filter(d => d._id && d._id.startsWith('CH_')).sort((a,b) => (a.num||0)-(b.num||0));
    const milestones= docs.filter(d => d._id && d._id.startsWith('MS_')).sort((a,b) => (a.day||0)-(b.day||0));
    const funding   = docs.filter(d => d._id && d._id.startsWith('FND_'));
    activityDb.find({}).sort({ date: -1 }).exec((e2, activities) => {
      res.json({ meta, chapters, milestones, funding, activities: activities || [] });
    });
  });
});

app.patch('/api/plan90/meta', (req, res) => {
  planDb.update({ _id: 'meta' }, { $set: req.body }, { upsert: true }, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

app.patch('/api/plan90/chapter/:id', (req, res) => {
  planDb.update({ _id: req.params.id }, { $set: req.body }, {}, (err, n) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: n });
  });
});

app.patch('/api/plan90/milestone/:id', (req, res) => {
  planDb.update({ _id: req.params.id }, { $set: req.body }, {}, (err, n) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: n });
  });
});

app.patch('/api/plan90/funding/:id', (req, res) => {
  planDb.update({ _id: req.params.id }, { $set: req.body }, {}, (err, n) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: n });
  });
});

// Activity log
app.get('/api/plan90/activity', (req, res) => {
  activityDb.find({}).sort({ date: -1 }).exec((err, docs) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(docs);
  });
});

app.post('/api/plan90/activity', (req, res) => {
  const entry = { ...req.body, date: req.body.date || new Date().toISOString().slice(0,10) };
  activityDb.insert(entry, (err, doc) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(doc);
  });
});

app.delete('/api/plan90/activity/:id', (req, res) => {
  activityDb.remove({ _id: req.params.id }, {}, (err, n) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ removed: n });
  });
});

// ── journal routes ───────────────────────────────────────────────────────────

// Seed static posts from journal-posts.ts data on first run
const STATIC_POSTS = require('./journal-seed');
function seedJournal() {
  journalDb.count({}, (err, count) => {
    if (!err && count === 0) journalDb.insert(STATIC_POSTS, () => {});
  });
}
seedJournal();

// List all posts (sorted newest first)
app.get('/api/journal', (req, res) => {
  journalDb.find({}).sort({ date: -1 }).exec((err, docs) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(docs);
  });
});

// Get single post by slug id
app.get('/api/journal/:id', (req, res) => {
  journalDb.findOne({ id: req.params.id }, (err, doc) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  });
});

// Create new post (writer only)
app.post('/api/journal', (req, res) => {
  const post = {
    ...req.body,
    id: req.body.id || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    date: req.body.date || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  journalDb.insert(post, (err, doc) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(doc);
  });
});

// Update post (writer only)
app.put('/api/journal/:id', (req, res) => {
  const update = { ...req.body, updatedAt: new Date().toISOString() };
  delete update._id;
  journalDb.update({ id: req.params.id }, { $set: update }, {}, (err, n) => {
    if (err) return res.status(500).json({ error: err.message });
    journalDb.findOne({ id: req.params.id }, (e, doc) => res.json(doc));
  });
});

// Delete post (writer only)
app.delete('/api/journal/:id', (req, res) => {
  journalDb.remove({ id: req.params.id }, {}, (err, n) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ removed: n });
  });
});

// ── journal comments ─────────────────────────────────────────────────────────

// Get comments for a post
app.get('/api/journal/:id/comments', (req, res) => {
  commentsDb.find({ postId: req.params.id }).sort({ createdAt: 1 }).exec((err, docs) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(docs);
  });
});

// Post a reader comment
app.post('/api/journal/:id/comments', (req, res) => {
  const comment = {
    postId: req.params.id,
    author: req.body.author || 'Reader',
    text: req.body.text,
    type: 'reader',
    createdAt: new Date().toISOString(),
  };
  commentsDb.insert(comment, (err, doc) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(doc);
  });
});

// Writer replies to a comment
app.post('/api/journal/:id/comments/:commentId/reply', (req, res) => {
  const reply = {
    postId: req.params.id,
    replyTo: req.params.commentId,
    author: 'Vishwa Shambhulingappa',
    text: req.body.text,
    type: 'writer',
    createdAt: new Date().toISOString(),
  };
  commentsDb.insert(reply, (err, doc) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(doc);
  });
});

// AI reply to a comment
app.post('/api/journal/:id/comments/:commentId/ai-reply', (req, res) => {
  const reply = {
    postId: req.params.id,
    replyTo: req.params.commentId,
    author: 'AI Assistant',
    text: req.body.text,
    type: 'ai',
    createdAt: new Date().toISOString(),
  };
  commentsDb.insert(reply, (err, doc) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(doc);
  });
});

// Delete a comment (writer)
app.delete('/api/journal/comments/:commentId', (req, res) => {
  commentsDb.remove({ _id: req.params.commentId }, {}, (err, n) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ removed: n });
  });
});

// ── boot ─────────────────────────────────────────────────────────────────────

init();
importChaptersIfNeeded();
app.listen(PORT, () => {
  console.log(`Novel API  →  http://localhost:${PORT}`);
  console.log(`Master     →  ${MASTER_PATH}  (read-only)`);
  console.log(`Versions   →  ${VERSIONS_DIR}`);
});
