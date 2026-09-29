const Incident = require('../models/Incident');
const Resolution = require('../models/Resolution');
const hindsight = require('./hindsight');
const llm = require('./llm');

class IncidentAgent {
  /**
   * Run full AI analysis on an incident:
   * 1. Extract context via LLM
   * 2. Recall matching historical memories via Hindsight
   * 3. Synthesize Investigation Report
   */
  async analyzeIncident(incidentId) {
    const incident = await Incident.findOne({ incidentId });
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    console.log(`[Incident Agent] Analyzing incident ${incidentId} (${incident.service})...`);

    // 1. LLM Context Extraction
    const extractedContext = await llm.extractIncidentContext({
      title: incident.title,
      service: incident.service,
      environment: incident.environment,
      severity: incident.severity,
      trigger: incident.trigger,
      symptoms: incident.symptoms,
      errorLogs: incident.errorLogs,
    });

    // 2. Hindsight Memory Recall
    const recallQuery = `${incident.service} ${extractedContext.errorType} ${extractedContext.suspectedComponent} ${incident.symptoms.join(' ')}`;
    const recallResponse = await hindsight.recall(recallQuery, {
      top_k: 3,
      serviceFilter: incident.service,
    });

    const recalledMemories = recallResponse.memories || [];

    // 3. Synthesize AI Investigation Report
    const investigationReport = await llm.generateInvestigationReport(incident, extractedContext, recalledMemories);

    // 4. Persist updated analysis in MongoDB
    incident.extractedContext = extractedContext;
    incident.recalledMemories = recalledMemories;
    incident.investigationReport = investigationReport;
    if (incident.status === 'Investigating') {
      incident.status = 'Identified';
    }
    await incident.save();

    console.log(`[Incident Agent] Analysis complete for ${incidentId}. Recalled ${recalledMemories.length} historical memories from Hindsight.`);
    return {
      incident,
      isLiveHindsight: recallResponse.isLiveHindsight,
    };
  }

  /**
   * Resolve incident & retain verified outcome in Hindsight
   */
  async resolveIncident(incidentId, { rootCause, fix, verification, outcomeVerified = true }) {
    const incident = await Incident.findOne({ incidentId });
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    if (!rootCause || !fix) {
      throw new Error('Root cause and fix description are required to resolve an incident');
    }

    // Save Resolution document
    const resolution = await Resolution.findOneAndUpdate(
      { incidentId },
      {
        incidentId,
        rootCause,
        fix,
        verification: verification || 'Verified by engineer inspection',
        outcomeVerified: Boolean(outcomeVerified),
        resolvedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Update Incident status
    incident.status = 'Resolved';
    await incident.save();

    let retainResult = null;
    // Retain in Hindsight ONLY if outcome is verified
    if (resolution.outcomeVerified) {
      console.log(`[Incident Agent] Outcome verified. Retaining lesson for ${incidentId} in Hindsight...`);
      retainResult = await hindsight.retain({
        incidentId: incident.incidentId,
        service: incident.service,
        symptoms: incident.symptoms,
        rootCause: resolution.rootCause,
        fix: resolution.fix,
        verification: resolution.verification,
      });

      resolution.retainedToHindsight = true;
      await resolution.save();
    } else {
      console.warn(`[Incident Agent] Outcome unverified for ${incidentId}. Skipping Hindsight memory retention.`);
    }

    return {
      incident,
      resolution,
      retainResult,
    };
  }
}

module.exports = new IncidentAgent();
