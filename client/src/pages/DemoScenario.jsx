import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import {
  createIncident,
  analyzeIncident,
  resolveIncident,
  clearDemoMemories,
  seedDemoData,
} from '../services/api';
import {
  PlaySquare,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export default function DemoScenario() {
  const [step, setStep] = useState(1);
  const [running, setRunning] = useState(false);
  const [testAIncident, setTestAIncident] = useState(null);
  const [testBIncident, setTestBIncident] = useState(null);
  const [testAResolution, setTestAResolution] = useState(null);
  const [logMessages, setLogMessages] = useState([]);

  const addLog = (msg) => {
    setLogMessages((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Step 1: Run Test A (Before Memory)
  const runTestABeforeMemory = async () => {
    setRunning(true);
    setLogMessages([]);
    addLog('Starting Test A: Simulating incident WITHOUT prior relevant Hindsight memory...');
    try {
      // Clear memory bank for clean baseline
      await clearDemoMemories();
      addLog('Cleared Hindsight memory bank to baseline.');

      const newInc = await createIncident({
        title: 'Payment API returning HTTP 500 (Test A)',
        service: 'payment-service',
        environment: 'production',
        severity: 'SEV-1',
        trigger: 'Deployment of v2.4.0 payment gateway handler',
        symptoms: ['HTTP 500 responses', 'Slow payment processing', 'Database connections exhausted'],
        errorLogs: `2026-09-29T08:42:11.102Z [ERROR] payment-service: MongoWaitQueueTimeoutError: Timed out waiting for a connection from the pool after 30000ms
at ConnectionPool.checkOut (node_modules/mongodb/lib/cmap/connection_pool.js:520:15)
at PaymentHandler.processCheckout (/app/src/handlers/payment.js:84:12)`,
      });

      addLog(`Created Test A Incident ${newInc.incident.incidentId}. Running AI analysis...`);
      const analysis = await analyzeIncident(newInc.incident.incidentId);
      setTestAIncident(analysis.incident);

      addLog(
        `Test A Complete! Recalled memories count: ${
          analysis.incident.recalledMemories?.length || 0
        }. The AI generated generic hypotheses without historical citations.`
      );
      setStep(2);
    } catch (err) {
      addLog(`Error in Test A: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  // Step 2: Resolve & Retain Test A
  const runResolveAndRetain = async () => {
    if (!testAIncident) return;
    setRunning(true);
    addLog(`Resolving incident ${testAIncident.incidentId} and retaining lesson in Hindsight...`);

    try {
      const res = await resolveIncident(testAIncident.incidentId, {
        rootCause:
          'Database connection leak in payment checkout retry handler after v2.4.0 deployment',
        fix: 'Wrapped DB session in try-finally block to ensure connection release and updated pool limits',
        verification: 'Active DB connections dropped from 100/100 to 12/100. Error rate returned to 0%',
        outcomeVerified: true,
      });

      setTestAResolution(res.resolution);
      addLog(
        `Lesson successfully retained in Hindsight for ${testAIncident.incidentId}! Ready for Test B.`
      );
      setStep(3);
    } catch (err) {
      addLog(`Error during retention: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  // Step 3: Run Test B (After Memory)
  const runTestBAfterMemory = async () => {
    setRunning(true);
    addLog(
      'Starting Test B: Submitting a NEW similar incident to test Hindsight memory recall...'
    );

    try {
      const newInc = await createIncident({
        title: 'Payment API slow checkout & 500 error (Test B)',
        service: 'payment-service',
        environment: 'production',
        severity: 'SEV-1',
        trigger: 'Deployment of v2.4.1 patch',
        symptoms: ['HTTP 500 responses', 'MongoWaitQueueTimeoutError', 'Database connections exhausted (100/100)'],
        errorLogs: `2026-09-29T10:15:02.881Z [ERROR] payment-service: MongoWaitQueueTimeoutError: Timed out waiting for a connection from the pool after 30000ms
at ConnectionPool.checkOut (node_modules/mongodb/lib/cmap/connection_pool.js:520:15)
at PaymentHandler.processCheckout (/app/src/handlers/payment.js:84:12)`,
      });

      addLog(`Created Test B Incident ${newInc.incident.incidentId}. Executing Hindsight recall...`);
      const analysis = await analyzeIncident(newInc.incident.incidentId);
      setTestBIncident(analysis.incident);

      addLog(
        `Test B Complete! Recalled ${
          analysis.incident.recalledMemories?.length || 0
        } historical memory! The AI cited the exact verified root cause from Test A!`
      );
      setStep(4);
    } catch (err) {
      addLog(`Error in Test B: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  const handleResetAll = async () => {
    setRunning(true);
    try {
      await seedDemoData();
      setStep(1);
      setTestAIncident(null);
      setTestBIncident(null);
      setTestAResolution(null);
      setLogMessages([]);
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#070a0f] min-h-screen">
      <Navbar title="Live Hackathon Demo Suite" />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0b0f17] via-slate-900 to-[#0b0f17] border border-indigo-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-300">
                Controlled Learning Demonstration
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              Before Memory vs. After Memory Test Scenario
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed mt-1">
              Demonstrates how RecallOps uses Hindsight to learn from verified incident resolutions and improve investigation accuracy on subsequent outages.
            </p>
          </div>

          <button
            onClick={handleResetAll}
            disabled={running}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-all shrink-0"
          >
            Reset Test Environment
          </button>
        </div>

        {/* Step Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div
            className={`p-5 rounded-xl border transition-all ${
              step === 1
                ? 'bg-purple-950/20 border-purple-500 shadow-lg shadow-purple-900/20'
                : step > 1
                ? 'bg-slate-900/60 border-slate-800 opacity-80'
                : 'bg-slate-900/30 border-slate-800 opacity-50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="w-7 h-7 rounded-full bg-purple-900 text-purple-200 font-bold text-xs flex items-center justify-center">
                1
              </span>
              {step > 1 && <CheckCircle2 className="w-5 h-5 text-teal-400" />}
            </div>
            <h3 className="text-sm font-bold text-slate-100 mb-1">Test A (Before Memory)</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Submit incident without prior relevant memory in Hindsight. Observe generic AI hypotheses.
            </p>
            {step === 1 && (
              <button
                onClick={runTestABeforeMemory}
                disabled={running}
                className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {running ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PlaySquare className="w-3.5 h-3.5" />}
                Run Test A
              </button>
            )}
          </div>

          {/* Step 2 */}
          <div
            className={`p-5 rounded-xl border transition-all ${
              step === 2
                ? 'bg-teal-950/20 border-teal-500 shadow-lg shadow-teal-900/20'
                : step > 2
                ? 'bg-slate-900/60 border-slate-800 opacity-80'
                : 'bg-slate-900/30 border-slate-800 opacity-50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="w-7 h-7 rounded-full bg-teal-900 text-teal-200 font-bold text-xs flex items-center justify-center">
                2
              </span>
              {step > 2 && <CheckCircle2 className="w-5 h-5 text-teal-400" />}
            </div>
            <h3 className="text-sm font-bold text-slate-100 mb-1">Resolve & Retain Lesson</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Record verified root cause and fix for Test A. Commit lesson to Hindsight memory bank.
            </p>
            {step === 2 && (
              <button
                onClick={runResolveAndRetain}
                disabled={running}
                className="w-full py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-slate-950 shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {running ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <BrainCircuit className="w-3.5 h-3.5" />}
                Resolve & Retain Memory
              </button>
            )}
          </div>

          {/* Step 3 */}
          <div
            className={`p-5 rounded-xl border transition-all ${
              step === 3
                ? 'bg-indigo-950/20 border-indigo-500 shadow-lg shadow-indigo-900/20'
                : step > 3
                ? 'bg-slate-900/60 border-slate-800 opacity-80'
                : 'bg-slate-900/30 border-slate-800 opacity-50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="w-7 h-7 rounded-full bg-indigo-900 text-indigo-200 font-bold text-xs flex items-center justify-center">
                3
              </span>
              {step > 3 && <CheckCircle2 className="w-5 h-5 text-teal-400" />}
            </div>
            <h3 className="text-sm font-bold text-slate-100 mb-1">Test B (After Memory)</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Submit similar new outage. Verify AI recalls Test A's exact verified root cause!
            </p>
            {step === 3 && (
              <button
                onClick={runTestBAfterMemory}
                disabled={running}
                className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {running ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PlaySquare className="w-3.5 h-3.5" />}
                Run Test B
              </button>
            )}
          </div>
        </div>

        {/* Live Side-by-Side Comparison */}
        {(testAIncident || testBIncident) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Test A Card */}
            <div className="p-5 rounded-xl bg-[#0b0f17] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-purple-400 uppercase">
                    Test A Result
                  </span>
                  <h4 className="text-sm font-bold text-slate-100">Before Memory Exists</h4>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-xs font-mono">
                  {testAIncident?.incidentId}
                </span>
              </div>

              {testAIncident && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">
                      Hindsight Memories Recalled:
                    </span>
                    <span className="font-semibold text-rose-400">
                      {testAIncident.recalledMemories?.length || 0} Historical Matches
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">
                      Initial AI Analysis Output:
                    </span>
                    <p className="text-slate-300">
                      {testAIncident.investigationReport?.summary ||
                        'Generic connection pool hypothesis derived from logs.'}
                    </p>
                  </div>

                  {testAResolution && (
                    <div className="p-3 rounded-lg bg-teal-950/30 border border-teal-800/40 space-y-1">
                      <span className="text-teal-400 text-[10px] uppercase font-bold block">
                        Verified Outcome Retained:
                      </span>
                      <p className="text-slate-200">{testAResolution.rootCause}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Test B Card */}
            <div className="p-5 rounded-xl bg-[#0b0f17] border border-indigo-800/50 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">
                    Test B Result
                  </span>
                  <h4 className="text-sm font-bold text-slate-100">After Memory Learned</h4>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-xs font-mono">
                  {testBIncident?.incidentId || 'Pending Step 3'}
                </span>
              </div>

              {testBIncident ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/50">
                    <span className="text-indigo-400 text-[10px] uppercase font-bold block">
                      Hindsight Memories Recalled:
                    </span>
                    <span className="font-bold text-teal-400 text-sm flex items-center gap-1.5 mt-0.5">
                      <BrainCircuit className="w-4 h-4 text-teal-400" />
                      {testBIncident.recalledMemories?.length || 0} Historical Match Found!
                    </span>
                  </div>

                  {testBIncident.recalledMemories?.[0] && (
                    <div className="p-3.5 rounded-lg bg-purple-950/30 border border-purple-800/40 space-y-1">
                      <span className="text-purple-300 text-[10px] uppercase font-bold block">
                        Cites Recalled Incident:
                      </span>
                      <p className="font-semibold text-slate-100">
                        {testBIncident.recalledMemories[0].incidentId}
                      </p>
                      <p className="text-[11px] text-purple-200/80 italic">
                        "{testBIncident.recalledMemories[0].rootCause}"
                      </p>
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">
                      Updated AI Investigation Report:
                    </span>
                    <p className="text-slate-300">
                      {testBIncident.investigationReport?.summary}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs space-y-2">
                  <ArrowRight className="w-6 h-6 mx-auto text-slate-600 animate-pulse" />
                  <p>Complete Steps 1 & 2 above to execute Test B comparison.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Demo Console Log */}
        {logMessages.length > 0 && (
          <div className="p-5 rounded-xl bg-[#0b0f17] border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-300">Live Demo Execution Log</h4>
            <div className="p-3.5 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-300 space-y-1 max-h-48 overflow-y-auto">
              {logMessages.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
