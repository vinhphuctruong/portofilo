const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../auth');

const router = express.Router();

// GET /api/profile - Public
router.get('/', (req, res) => {
  const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get();
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  // Parse skills JSON
  try {
    profile.skills = JSON.parse(profile.skills);
  } catch {
    profile.skills = [];
  }
  res.json(profile);
});

// PUT /api/profile - Admin only
router.put('/', authMiddleware, (req, res) => {
  const { name, title, bio, avatar, email, phone, location, github, linkedin, website, skills, resume_url } = req.body;

  const skillsJson = Array.isArray(skills) ? JSON.stringify(skills) : (skills || '[]');

  db.prepare(`
    UPDATE profile SET
      name = COALESCE(?, name),
      title = COALESCE(?, title),
      bio = COALESCE(?, bio),
      avatar = COALESCE(?, avatar),
      email = COALESCE(?, email),
      phone = COALESCE(?, phone),
      location = COALESCE(?, location),
      github = COALESCE(?, github),
      linkedin = COALESCE(?, linkedin),
      website = COALESCE(?, website),
      skills = COALESCE(?, skills),
      resume_url = COALESCE(?, resume_url)
    WHERE id = 1
  `).run(name, title, bio, avatar, email, phone, location, github, linkedin, website, skillsJson, resume_url);

  const updated = db.prepare('SELECT * FROM profile WHERE id = 1').get();
  try { updated.skills = JSON.parse(updated.skills); } catch { updated.skills = []; }
  res.json(updated);
});

module.exports = router;
