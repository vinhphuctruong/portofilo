const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../auth');

const router = express.Router();

// GET /api/projects - Public
router.get('/', (req, res) => {
  const projects = db.prepare('SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC').all();
  projects.forEach(p => {
    try { p.tech_stack = JSON.parse(p.tech_stack); } catch { p.tech_stack = []; }
  });
  res.json(projects);
});

// GET /api/projects/:id - Public
router.get('/:id', (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  try { project.tech_stack = JSON.parse(project.tech_stack); } catch { project.tech_stack = []; }
  res.json(project);
});

// POST /api/projects - Admin only
router.post('/', authMiddleware, (req, res) => {
  const { title, description, image, live_url, github_url, tech_stack, category, featured, sort_order } = req.body;

  if (!title) return res.status(400).json({ error: 'Title is required' });

  const techJson = Array.isArray(tech_stack) ? JSON.stringify(tech_stack) : (tech_stack || '[]');

  const result = db.prepare(`
    INSERT INTO projects (title, description, image, live_url, github_url, tech_stack, category, featured, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    title,
    description || '',
    image || '',
    live_url || '',
    github_url || '',
    techJson,
    category || 'Web',
    featured ? 1 : 0,
    sort_order || 0
  );

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
  try { project.tech_stack = JSON.parse(project.tech_stack); } catch { project.tech_stack = []; }
  res.status(201).json(project);
});

// PUT /api/projects/:id - Admin only
router.put('/:id', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Project not found' });

  const { title, description, image, live_url, github_url, tech_stack, category, featured, sort_order } = req.body;
  const techJson = Array.isArray(tech_stack) ? JSON.stringify(tech_stack) : (tech_stack || existing.tech_stack);

  db.prepare(`
    UPDATE projects SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      image = COALESCE(?, image),
      live_url = COALESCE(?, live_url),
      github_url = COALESCE(?, github_url),
      tech_stack = ?,
      category = COALESCE(?, category),
      featured = ?,
      sort_order = COALESCE(?, sort_order)
    WHERE id = ?
  `).run(
    title, description, image, live_url, github_url,
    techJson, category, featured !== undefined ? (featured ? 1 : 0) : existing.featured,
    sort_order, req.params.id
  );

  const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  try { updated.tech_stack = JSON.parse(updated.tech_stack); } catch { updated.tech_stack = []; }
  res.json(updated);
});

// DELETE /api/projects/:id - Admin only
router.delete('/:id', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Project not found' });

  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ message: 'Project deleted successfully' });
});

module.exports = router;
