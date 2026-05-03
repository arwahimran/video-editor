const express = require('express');
const router = express.Router();
const Datastore = require('nedb-promises');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 }  // 500MB
});
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// ── Database files (saved in your project folder) ──
const Project = Datastore.create({ filename: 'data/projects.db', autoload: true });
const Clip = Datastore.create({ filename: 'data/clips.db', autoload: true });

// ── File Upload Setup ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ════════════════════════════════
//   PROJECT ROUTES (CRUD)
// ════════════════════════════════

// GET — all projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find({});
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET — single project
router.get('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST — create project
router.post('/projects', async (req, res) => {
  try {
    const { title, description, genre } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required!' });

    const project = await Project.insert({
      title,
      description: description || '',
      genre: genre || 'General',
      status: 'In Progress',
      clipCount: 0,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT — update project
router.put('/projects/:id', async (req, res) => {
  try {
    await Project.update({ _id: req.params.id }, { $set: req.body });
    const project = await Project.findOne({ _id: req.params.id });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE — delete project
router.delete('/projects/:id', async (req, res) => {
  try {
    await Project.remove({ _id: req.params.id });
    await Clip.remove({ projectId: req.params.id }, { multi: true });
    res.json({ success: true, message: 'Project deleted!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════
//   CLIP ROUTES (CRUD)
// ════════════════════════════════

// GET — clips for a project
router.get('/projects/:id/clips', async (req, res) => {
  try {
    const clips = await Clip.find({ projectId: req.params.id });
    res.json({ success: true, data: clips });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST — add clip with video upload
router.post('/projects/:id/clips', upload.single('video'), async (req, res) => {
  try {
    const { name, startTime, endTime, notes } = req.body;

    const clip = await Clip.insert({
      projectId: req.params.id,
      name: name || 'Untitled Clip',
      videoFile: req.file ? `/uploads/${req.file.filename}` : null,
      startTime: parseFloat(startTime) || 0,
      endTime: parseFloat(endTime) || 0,
      notes: notes || '',
      createdAt: new Date().toISOString()
    });

    // Update clip count
    const count = await Clip.count({ projectId: req.params.id });
    await Project.update({ _id: req.params.id }, { $set: { clipCount: count } });

    res.status(201).json({ success: true, data: clip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE — delete clip
router.delete('/clips/:id', async (req, res) => {
  try {
    const clip = await Clip.findOne({ _id: req.params.id });
    await Clip.remove({ _id: req.params.id });
    if (clip) {
      const count = await Clip.count({ projectId: clip.projectId });
      await Project.update({ _id: clip.projectId }, { $set: { clipCount: count } });
    }
    res.json({ success: true, message: 'Clip deleted!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Health check
router.get('/health', async (req, res) => {
  try {
    const totalProjects = await Project.count({});
    const totalClips = await Clip.count({});
    res.json({ success: true, totalProjects, totalClips });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;