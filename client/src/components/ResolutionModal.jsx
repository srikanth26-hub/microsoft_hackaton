import React, { useState } from 'react';
import { X, CheckCircle2, BrainCircuit } from 'lucide-react';

export default function ResolutionModal({ isOpen, onClose, incidentId, onSubmit }) {
  const [formData, setFormData] = useState({
    rootCause: '',
    fix: '',
    verification: '',
    outcomeVerified: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.rootCause || !formData.fix) {
      setError('Root Cause and Fix Description are required.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to record resolution');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b0f17] border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-950/60 border border-teal-800/60 text-teal-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Record Resolution ({incidentId})</h2>
              <p className="text-xs text-slate-400">Document verified outcome to retain as a Hindsight memory lesson</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Verified Root Cause *
            </label>
            <textarea
              name="rootCause"
              required
              rows={2}
              placeholder="e.g. Database connection leak in payment checkout retry handler after v2.4.0 deployment"
              value={formData.rootCause}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Applied Fix / Remediation *
            </label>
            <textarea
              name="fix"
              required
              rows={2}
              placeholder="e.g. Wrapped database session in try-finally block to ensure connection cleanup, expanded pool limit to 150, deployed patch v2.4.1"
              value={formData.fix}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Verification Proof & Metrics
            </label>
            <input
              type="text"
              name="verification"
              placeholder="e.g. Active DB connections dropped from 100/100 to 12/100; error rate returned to 0%"
              value={formData.verification}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Verification Checkbox */}
          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-start gap-3">
            <input
              type="checkbox"
              id="outcomeVerified"
              name="outcomeVerified"
              checked={formData.outcomeVerified}
              onChange={handleChange}
              className="mt-0.5 w-4 h-4 rounded border-slate-700 text-teal-500 focus:ring-teal-500 bg-slate-900"
            />
            <label htmlFor="outcomeVerified" className="text-xs leading-relaxed cursor-pointer select-none">
              <span className="font-semibold text-purple-300 flex items-center gap-1.5 mb-0.5">
                <BrainCircuit className="w-3.5 h-3.5 text-teal-400" />
                Retain verified lesson in Hindsight Memory Engine
              </span>
              <span className="text-slate-400">
                Only verified outcomes are saved to Hindsight so future AI investigations can benefit from verified facts rather than unverified guesses.
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-slate-950 shadow-lg shadow-teal-900/30 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {submitting ? 'Retaining Lesson...' : 'Confirm Resolution & Retain Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
