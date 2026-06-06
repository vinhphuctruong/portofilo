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
  // Parse skills and services JSON
  try { profile.skills = JSON.parse(profile.skills); } catch { profile.skills = []; }
  try { profile.services = JSON.parse(profile.services); } catch { profile.services = []; }
  res.json(profile);
});

// PUT /api/profile - Admin only
router.put('/', authMiddleware, (req, res) => {
  const { name, title, bio, avatar, email, phone, location, github, linkedin, website, skills, services, resume_url } = req.body;

  const skillsJson = Array.isArray(skills) ? JSON.stringify(skills) : (skills || '[]');
  const servicesJson = Array.isArray(services) ? JSON.stringify(services) : (services || '[]');

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
      services = COALESCE(?, services),
      resume_url = COALESCE(?, resume_url)
    WHERE id = 1
  `).run(name, title, bio, avatar, email, phone, location, github, linkedin, website, skillsJson, servicesJson, resume_url);

  const updated = db.prepare('SELECT * FROM profile WHERE id = 1').get();
  try { updated.skills = JSON.parse(updated.skills); } catch { updated.skills = []; }
  try { updated.services = JSON.parse(updated.services); } catch { updated.services = []; }
  res.json(updated);
});

module.exports = router;
