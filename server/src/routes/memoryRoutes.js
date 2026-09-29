const express = require('express');
const router = express.Router();
const hindsight = require('../services/hindsight');

// Check Hindsight connection status
router.get('/status', async (req, res) => {
  try {
    const health = await hindsight.checkHealth();
    res.json({ success: true, ...health });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all retained memories
router.get('/all', async (req, res) => {
  try {
    const memories = hindsight.getMemories();
    const health = await hindsight.checkHealth();
    res.json({
      success: true,
      isLiveHindsight: health.isLive,
      count: memories.length,
      memories,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Trigger Hindsight Recall
router.post('/search', async (req, res) => {
  try {
    const { query, serviceFilter, top_k } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Search query is required' });
    }

    const result = await hindsight.recall(query, {
      top_k: top_k || 5,
      serviceFilter: serviceFilter || '',
    });

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Trigger Hindsight Reflect
router.post('/reflect', async (req, res) => {
  try {
    const { query } = req.body;
    const searchPrompt = query || 'What are the main recurring causes of outages across payment and auth services?';
    const result = await hindsight.reflect(searchPrompt);
    res.json({ success: true, query: searchPrompt, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
