const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    incidentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
      index: true,
    },
    environment: {
      type: String,
      default: 'production',
    },
    severity: {
      type: String,
      enum: ['SEV-1', 'SEV-2', 'SEV-3', 'SEV-4'],
      default: 'SEV-2',
      index: true,
    },
    status: {
      type: String,
      enum: ['Investigating', 'Identified', 'Resolving', 'Resolved'],
      default: 'Investigating',
      index: true,
    },
    errorLogs: {
      type: String,
      required: true,
    },
    symptoms: {
      type: [String],
      default: [],
    },
    trigger: {
      type: String,
      default: '',
    },
    extractedContext: {
      errorType: String,
      suspectedComponent: String,
      impact: String,
      hypotheses: [String],
    },
    recalledMemories: [
      {
        memoryId: String,
        incidentId: String,
        service: String,
        symptoms: String,
        rootCause: String,
        fix: String,
        relevanceScore: Number,
        relevanceReason: String,
      },
    ],
    investigationReport: {
      summary: String,
      hypotheses: [
        {
          title: String,
          description: String,
          confidence: String,
        },
      ],
      supportingEvidence: [String],
      recommendedSteps: [String],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Incident', incidentSchema);
