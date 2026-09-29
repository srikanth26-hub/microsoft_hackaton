const express = require('express');
const router = express.Router();
const { seedDatabase } = require('../seed');
const hindsight = require('../services/hindsight');
const Incident = require('../models/Incident');

// Trigger demo seed
router.post('/seed', async (req, res) => {
  try {
    await seedDatabase();
    const incidents = await Incident.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      message: 'Demo dataset and Hindsight memories successfully re-initialized.',
      incidents,
      memories: hindsight.getMemories(),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Clear memories for "Before Memory" demo test
router.post('/clear-memories', async (req, res) => {
  try {
    hindsight.localMemoryBank = [];
    res.json({
      success: true,
      message: 'Hindsight memory bank cleared for "Before Memory" testing.',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
