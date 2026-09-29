const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const Resolution = require('../models/Resolution');
const incidentAgent = require('../services/incidentAgent');

// List incidents
router.get('/', async (req, res) => {
  try {
    const { status, service, severity } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (service && service !== 'all') {
      query.service = service;
    }
    if (severity && severity !== 'all') {
      query.severity = severity;
    }

    const incidents = await Incident.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: incidents.length, incidents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create new incident
router.post('/', async (req, res) => {
  try {
    const { title, service, environment, severity, errorLogs, symptoms, trigger } = req.body;

    if (!title || !service || !errorLogs) {
      return res.status(400).json({ success: false, error: 'Title, service, and error logs are required.' });
    }

    // Generate unique ID
    const count = await Incident.countDocuments();
    const incidentId = `INC-2026-${String(count + 1).padStart(3, '0')}`;

    const parsedSymptoms = Array.isArray(symptoms)
      ? symptoms
      : String(symptoms || '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);

    const incident = new Incident({
      incidentId,
      title,
      service,
      environment: environment || 'production',
      severity: severity || 'SEV-2',
      status: 'Investigating',
      errorLogs,
      symptoms: parsedSymptoms,
      trigger: trigger || '',
    });

    await incident.save();

    // Automatically trigger initial AI analysis
    try {
      await incidentAgent.analyzeIncident(incident.incidentId);
    } catch (analysisErr) {
      console.warn(`[Incident Route] Initial analysis deferred for ${incidentId}:`, analysisErr.message);
    }

    const updatedIncident = await Incident.findOne({ incidentId });
    res.status(201).json({ success: true, incident: updatedIncident });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single incident with resolution
router.get('/:id', async (req, res) => {
  try {
    const incident = await Incident.findOne({ incidentId: req.params.id });
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }

    const resolution = await Resolution.findOne({ incidentId: req.params.id });
    res.json({ success: true, incident, resolution });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Trigger AI analysis and memory recall
router.post('/:id/analyze', async (req, res) => {
  try {
    const result = await incidentAgent.analyzeIncident(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Resolve incident & retain in Hindsight
router.post('/:id/resolve', async (req, res) => {
  try {
    const { rootCause, fix, verification, outcomeVerified } = req.body;
    const result = await incidentAgent.resolveIncident(req.params.id, {
      rootCause,
      fix,
      verification,
      outcomeVerified,
    });

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Delete incident
router.delete('/:id', async (req, res) => {
  try {
    await Incident.deleteOne({ incidentId: req.params.id });
    await Resolution.deleteOne({ incidentId: req.params.id });
    res.json({ success: true, message: `Deleted incident ${req.params.id}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
