import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import ResolutionModal from '../components/ResolutionModal';
import { getIncidentById, analyzeIncident, resolveIncident } from '../services/api';
import {
  ArrowLeft,
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  Search,
  Wrench,
  Sparkles,
  FileCode,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export default function IncidentInvestigation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [incident, setIncident] = useState(null);
  const [resolution, setResolution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const fetchIncidentDetails = async () => {
    setLoading(true);
    try {
      const data = await getIncidentById(id);
      setIncident(data.incident);
      setResolution(data.resolution);
    } catch (err) {
      setError(err.message || 'Failed to fetch incident details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentDetails();
  }, [id]);

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      const data = await analyzeIncident(id);
      setIncident(data.incident);
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleResolveSubmit = async (formData) => {
    const data = await resolveIncident(id, formData);
    setIncident(data.incident);
    setResolution(data.resolution);
  };

  if (loading) {
    return (
      <div className="flex-1 bg-[#070a0f] min-h-screen flex items-center justify-center">
        <div className="text-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
          <p className="text-xs">Loading incident investigation context...</p>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex-1 bg-[#070a0f] min-h-screen p-8 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-base font-bold text-slate-200">Incident {id} Not Found</h2>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-slate-800 text-xs font-semibold rounded-lg text-slate-200"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const extracted = incident.extractedContext || {};
  const report = incident.investigationReport || {};
  const memories = incident.recalledMemories || [];

  return (
    <div className="flex-1 flex flex-col bg-[#070a0f] min-h-screen pb-16">
      <Navbar title={`Investigation: ${incident.incidentId}`} />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Breadcrumb & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-purple-400">
                  {incident.incidentId}
                </span>
                <SeverityBadge severity={incident.severity} />
                <StatusBadge status={incident.status} />
              </div>
              <h2 className="text-xl font-bold text-slate-100 mt-1">{incident.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunAnalysis}
              disabled={analyzing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-purple-950/60 border border-purple-800/60 hover:bg-purple-900/60 text-xs font-semibold text-purple-300 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${analyzing ? 'animate-spin' : ''}`} />
              {analyzing ? 'Recalling Hindsight...' : 'Re-Run Hindsight Recall'}
            </button>

            {incident.status !== 'Resolved' ? (
              <button
                onClick={() => setIsResolveModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-slate-950 shadow-lg shadow-teal-900/30 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Resolve & Retain Lesson
              </button>
            ) : (
              <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-950/60 border border-teal-800/60 text-xs font-semibold text-teal-300">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                Lesson Retained in Hindsight
              </span>
            )}
          </div>
        </div>

        {/* Resolved Banner */}
        {resolution && (
          <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-800/50 space-y-2">
            <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              Incident Verified & Resolved — Lesson Committed to Hindsight Memory
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1 text-slate-300">
              <div>
                <span className="text-slate-500 block font-semibold">Verified Root Cause:</span>
                <p className="mt-0.5 text-slate-200">{resolution.rootCause}</p>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">Applied Fix:</span>
                <p className="mt-0.5 text-slate-200">{resolution.fix}</p>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">Verification Proof:</span>
                <p className="mt-0.5 text-slate-200">{resolution.verification}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid: Left Column (Intake & Context) | Right Column (Hindsight & Investigation Report) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Extracted Context Box */}
            <div className="p-5 rounded-xl bg-[#0b0f17] border border-slate-800/80 space-y-4">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-sm border-b border-slate-800 pb-3">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Extracted Incident Context
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[11px]">Affected Service</span>
                  <p className="font-semibold text-slate-200 mt-0.5">{incident.service}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[11px]">Environment</span>
                  <p className="font-semibold text-slate-200 uppercase mt-0.5">
                    {incident.environment}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[11px]">Error Category</span>
                  <p className="font-semibold text-purple-300 mt-0.5">
                    {extracted.errorType || 'Unknown'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[11px]">Suspected Component</span>
                  <p className="font-semibold text-indigo-300 mt-0.5">
                    {extracted.suspectedComponent || 'Unknown'}
                  </p>
                </div>
              </div>

              {incident.trigger && (
                <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/40 text-xs">
                  <span className="text-indigo-400 font-semibold block mb-0.5">
                    Trigger / Recent Deployment:
                  </span>
                  <span className="text-slate-300">{incident.trigger}</span>
                </div>
              )}
            </div>

            {/* Symptoms Box */}
            <div className="p-5 rounded-xl bg-[#0b0f17] border border-slate-800/80 space-y-3">
              <h3 className="text-sm font-bold text-slate-200">Observed Telemetry Symptoms</h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {incident.symptoms.map((symptom, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                    <span>{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Raw Error Logs Box */}
            <div className="p-5 rounded-xl bg-[#0b0f17] border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
                  <FileCode className="w-4 h-4 text-purple-400" />
                  Raw Exception Logs
                </div>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-80">
                {incident.errorLogs}
              </pre>
            </div>
          </div>

          {/* Right Column (7 Cols) - Hindsight Memories & Investigation Report */}
          <div className="lg:col-span-7 space-y-6">
            {/* Hindsight Recalled Memories Card */}
            <div className="p-6 rounded-xl bg-[#0b0f17] border border-purple-800/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-950/80 border border-purple-700/60 text-purple-400">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">
                      Hindsight Recalled Memories
                    </h3>
                    <p className="text-xs text-slate-400">
                      Relevant historical incidents retrieved from persistent episodic memory bank
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-purple-950/80 border border-purple-700/60 text-purple-300 text-xs font-semibold">
                  {memories.length} Matches Found
                </span>
              </div>

              {memories.length === 0 ? (
                <div className="p-6 text-center text-slate-400 space-y-2 bg-slate-900/50 rounded-xl border border-slate-800">
                  <Search className="w-6 h-6 text-slate-500 mx-auto" />
                  <p className="text-xs">
                    No relevant historical memories found in Hindsight for this incident pattern.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Once resolved, this incident's verified fix will be retained to help future investigations!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {memories.map((mem) => (
                    <div
                      key={mem.memoryId || mem.incidentId}
                      className="p-4 rounded-xl bg-slate-900/90 border border-purple-900/40 space-y-3 hover:border-purple-600/50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-purple-300 text-xs">
                            {mem.incidentId}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium">
                            {mem.service}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-teal-950/80 border border-teal-800/60 text-teal-300 text-[11px] font-semibold">
                          Match Similarity: {Math.round((mem.relevanceScore || 0.88) * 100)}%
                        </span>
                      </div>

                      <p className="text-xs text-purple-200/80 italic bg-purple-950/40 p-2 rounded border border-purple-900/30">
                        "{mem.relevanceReason || 'High semantic match on error symptoms & service'}"
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                          <span className="text-slate-500 block font-semibold text-[10px]">
                            Verified Past Root Cause:
                          </span>
                          <span className="text-slate-200">{mem.rootCause}</span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-teal-950/30 border border-teal-800/40">
                          <span className="text-teal-400 block font-semibold text-[10px]">
                            Verified Fix Applied:
                          </span>
                          <span className="text-slate-200">{mem.fix}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Hypotheses vs Verified Facts Card */}
            <div className="p-6 rounded-xl bg-[#0b0f17] border border-slate-800/80 space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-base border-b border-slate-800 pb-3">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                AI Hypotheses (Strictly Unverified)
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                RecallOps distinguishes unverified AI hypotheses from verified historical facts. An SRE engineer must verify these before applying remediation.
              </p>

              <div className="space-y-3">
                {(report.hypotheses || []).map((hyp, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900 border border-amber-800/30 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-amber-300">{hyp.title}</h4>
                      <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/60 text-amber-300 text-[10px] font-medium">
                        {hyp.confidence}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{hyp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Supporting Evidence to Inspect */}
            <div className="p-6 rounded-xl bg-[#0b0f17] border border-slate-800/80 space-y-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-400" />
                Supporting Evidence to Inspect
              </h3>

              <ul className="space-y-2 text-xs text-slate-300">
                {(report.supportingEvidence || []).map((ev, idx) => (
                  <li key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    {ev}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Investigation Steps */}
            <div className="p-6 rounded-xl bg-[#0b0f17] border border-slate-800/80 space-y-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-teal-400" />
                Recommended Next Actions
              </h3>

              <ol className="space-y-2 text-xs text-slate-300">
                {(report.recommendedSteps || []).map((step, idx) => (
                  <li
                    key={idx}
                    className="p-3.5 rounded-lg bg-teal-950/20 border border-teal-800/30 flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-teal-900 text-teal-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </main>

      <ResolutionModal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        incidentId={incident.incidentId}
        onSubmit={handleResolveSubmit}
      />
    </div>
  );
}
