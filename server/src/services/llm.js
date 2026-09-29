const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');

/**
 * AI LLM Service supporting Gemini, Groq, and structured diagnostic reasoning.
 * Strictly separates unverified AI Hypotheses from Verified Facts.
 */
class LLMService {
  constructor() {
    this.geminiKey = process.env.GEMINI_API_KEY;
    this.groqKey = process.env.GROQ_API_KEY;

    if (this.geminiKey) {
      this.genAI = new GoogleGenerativeAI(this.geminiKey);
    }
    if (this.groqKey) {
      this.groq = new Groq({ apiKey: this.groqKey });
    }
  }

  /**
   * Extract structured incident context from raw intake data
   */
  async extractIncidentContext(incidentData) {
    const prompt = `You are a Senior SRE & Incident Response AI Agent.
Analyze the following incident report:
Title: ${incidentData.title}
Service: ${incidentData.service}
Environment: ${incidentData.environment}
Severity: ${incidentData.severity}
Trigger: ${incidentData.trigger || 'Not specified'}
Symptoms: ${Array.isArray(incidentData.symptoms) ? incidentData.symptoms.join(', ') : incidentData.symptoms}
Error Logs:
${incidentData.errorLogs}

Return a valid JSON object with the following exact keys:
{
  "errorType": "Concise classification of the error (e.g., ConnectionTimeout, TokenExpiry, MemoryLeak)",
  "suspectedComponent": "Specific subsystem or resource (e.g., Database Connection Pool, Auth Cache)",
  "impact": "Summary of business and technical impact",
  "hypotheses": ["List of 2-3 unverified AI hypotheses strictly labeled as assumptions needing verification"]
}
DO NOT include markdown block formatting, return raw JSON string.`;

    try {
      let rawJson = null;

      if (this.geminiKey) {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        rawJson = result.response.text();
      } else if (this.groqKey) {
        const response = await this.groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.3-70b-versatile',
        });
        rawJson = response.choices[0]?.message?.content;
      }

      if (rawJson) {
        const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
      }
    } catch (err) {
      console.warn('[LLM Service] API call failed or key not configured. Using rule-based extraction fallback:', err.message);
    }

    // Rule-based extraction fallback
    const logsLower = (incidentData.errorLogs || '').toLowerCase();
    let errorType = 'System Fault / Timeout';
    let suspectedComponent = 'Backend Application Engine';

    if (logsLower.includes('timeout') || logsLower.includes('mongowaitqueue') || logsLower.includes('pool')) {
      errorType = 'Database Connection Timeout';
      suspectedComponent = 'Database Connection Pool';
    } else if (logsLower.includes('jwt') || logsLower.includes('auth') || logsLower.includes('token')) {
      errorType = 'Authentication Failure';
      suspectedComponent = 'Auth & Token Cache';
    } else if (logsLower.includes('504') || logsLower.includes('gateway') || logsLower.includes('upstream')) {
      errorType = 'Upstream Gateway Error';
      suspectedComponent = 'Microservice Ingress Gateway';
    }

    return {
      errorType,
      suspectedComponent,
      impact: `High severity impact on ${incidentData.service} in ${incidentData.environment}.`,
      hypotheses: [
        `[Hypothesis] ${suspectedComponent} reached exhaustion due to unclosed handles following recent deployment.`,
        `[Hypothesis] Spike in incoming request volume triggered cascading wait-queue timeouts.`,
      ],
    };
  }

  /**
   * Generate complete Investigation Report combining current incident, extracted context, and Hindsight recalled memories
   */
  async generateInvestigationReport(incident, extractedContext, recalledMemories) {
    const prompt = `You are RecallOps SRE Assistant. Generate an investigation report for:
Incident ID: ${incident.incidentId}
Title: ${incident.title}
Service: ${incident.service}
Extracted Error Type: ${extractedContext.errorType}
Suspected Component: ${extractedContext.suspectedComponent}

Recalled Historical Memories from Hindsight:
${JSON.stringify(recalledMemories, null, 2)}

Instructions:
1. Provide a concise executive summary.
2. Formulate 2-3 structured hypotheses, explicitly tagged with confidence (High, Medium, Low). Remind that hypotheses are UNVERIFIED.
3. List 3 concrete pieces of supporting evidence an engineer should inspect.
4. Recommend 3 step-by-step diagnostic or remediation steps.

Return JSON in this format:
{
  "summary": "...",
  "hypotheses": [
    { "title": "...", "description": "...", "confidence": "High" }
  ],
  "supportingEvidence": ["...", "..."],
  "recommendedSteps": ["...", "..."]
}
Raw JSON only.`;

    try {
      let rawJson = null;

      if (this.geminiKey) {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        rawJson = result.response.text();
      } else if (this.groqKey) {
        const response = await this.groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.3-70b-versatile',
        });
        rawJson = response.choices[0]?.message?.content;
      }

      if (rawJson) {
        const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
      }
    } catch (err) {
      console.warn('[LLM Service] Report synthesis fallback triggered:', err.message);
    }

    // High-quality structured fallback
    const hasMemories = recalledMemories && recalledMemories.length > 0;
    const topMemory = hasMemories ? recalledMemories[0] : null;

    let summary = `Incident ${incident.incidentId} exhibits symptoms consistent with ${extractedContext.errorType} in ${incident.service}.`;
    if (topMemory) {
      summary += ` Hindsight recalled matching historical incident ${topMemory.incidentId} (${topMemory.relevanceReason}), which was caused by "${topMemory.rootCause}".`;
    } else {
      summary += ` No closely matching historical incidents were found in Hindsight memory. Initial investigation should focus on recent deployments and resource metrics.`;
    }

    const hypotheses = [
      {
        title: topMemory ? `Pattern Match: ${topMemory.rootCause}` : `Resource Bottleneck in ${extractedContext.suspectedComponent}`,
        description: topMemory
          ? `Current symptoms closely parallel ${topMemory.incidentId}. The problem is likely related to unreleased resources or missing session cleanup.`
          : `High request concurrency or leaked handles are causing connection wait timeouts in ${extractedContext.suspectedComponent}.`,
        confidence: topMemory ? 'High (Historical Pattern Match)' : 'Medium (AI Hypothesis - Needs Engineer Verification)',
      },
      {
        title: `Deployment Configuration Regression`,
        description: `Changes introduced in the latest release (${incident.trigger || 'recent deployment'}) altered connection pool limits or timeout thresholds.`,
        confidence: 'Medium (Unverified)',
      },
    ];

    const supportingEvidence = [
      `1. Connection Pool Utilization: Check metrics for ${extractedContext.suspectedComponent} active vs idle connections around incident start.`,
      `2. Deployment Diff Analysis: Inspect commit history for changes to database initialization and cleanup logic.`,
      `3. Upstream Latency Logs: Correlate payment handler execution times with HTTP 500 error timestamps.`,
    ];

    const recommendedSteps = [
      topMemory
        ? `1. Review the fix applied in ${topMemory.incidentId}: "${topMemory.fix}" to check if similar code paths were modified.`
        : `1. Inspect database connection pool limits and release callbacks in ${incident.service}.`,
      `2. Verify active database connections via monitoring dashboard or diagnostic CLI.`,
      `3. Apply temporary pool expansion or revert latest deployment if leak is confirmed, then record verified outcome in RecallOps.`,
    ];

    return {
      summary,
      hypotheses,
      supportingEvidence,
      recommendedSteps,
    };
  }
}

module.exports = new LLMService();
