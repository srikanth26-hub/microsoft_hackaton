const mongoose = require('mongoose');

const resolutionSchema = new mongoose.Schema(
  {
    incidentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    rootCause: {
      type: String,
      required: true,
    },
    fix: {
      type: String,
      required: true,
    },
    verification: {
      type: String,
      required: true,
    },
    outcomeVerified: {
      type: Boolean,
      default: true,
    },
    retainedToHindsight: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resolution', resolutionSchema);
