const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const NOVEL_PATH = path.resolve(__dirname, '../master_novel.json');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

function readNovel() {
  return JSON.parse(fs.readFileSync(NOVEL_PATH, 'utf8'));
}

function writeNovel(data) {
  fs.writeFileSync(NOVEL_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// Get full novel
app.get('/api/novel', (req, res) => {
  try {
    res.json(readNovel());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Replace full novel
app.put('/api/novel', (req, res) => {
  try {
    writeNovel(req.body);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Patch a top-level section
app.patch('/api/novel/:section', (req, res) => {
  try {
    const novel = readNovel();
    novel.master_novel[req.params.section] = req.body;
    writeNovel(novel);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Characters ---
app.get('/api/novel/characters', (req, res) => {
  const novel = readNovel();
  res.json(novel.master_novel.characters);
});

app.put('/api/novel/characters/:id', (req, res) => {
  try {
    const novel = readNovel();
    const idx = novel.master_novel.characters.findIndex(c => c.character_id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    novel.master_novel.characters[idx] = req.body;
    writeNovel(novel);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/novel/characters', (req, res) => {
  try {
    const novel = readNovel();
    novel.master_novel.characters.push(req.body);
    writeNovel(novel);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/novel/characters/:id', (req, res) => {
  try {
    const novel = readNovel();
    novel.master_novel.characters = novel.master_novel.characters.filter(
      c => c.character_id !== req.params.id
    );
    writeNovel(novel);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Chapters ---
app.get('/api/novel/chapters', (req, res) => {
  const novel = readNovel();
  res.json(novel.master_novel.chapters);
});

app.put('/api/novel/chapters/:id', (req, res) => {
  try {
    const novel = readNovel();
    const idx = novel.master_novel.chapters.findIndex(c => c.chapter_id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    novel.master_novel.chapters[idx] = req.body;
    writeNovel(novel);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/novel/chapters', (req, res) => {
  try {
    const novel = readNovel();
    novel.master_novel.chapters.push(req.body);
    writeNovel(novel);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/novel/chapters/:id', (req, res) => {
  try {
    const novel = readNovel();
    novel.master_novel.chapters = novel.master_novel.chapters.filter(
      c => c.chapter_id !== req.params.id
    );
    writeNovel(novel);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Novel API running at http://localhost:${PORT}`);
  console.log(`Serving: ${NOVEL_PATH}`);
});
