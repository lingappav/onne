const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { BENCHMARK_NOVELS } = require('./benchmark-data');

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

// ── boot ─────────────────────────────────────────────────────────────────────

init();
app.listen(PORT, () => {
  console.log(`Novel API  →  http://localhost:${PORT}`);
  console.log(`Master     →  ${MASTER_PATH}  (read-only)`);
  console.log(`Versions   →  ${VERSIONS_DIR}`);
});
