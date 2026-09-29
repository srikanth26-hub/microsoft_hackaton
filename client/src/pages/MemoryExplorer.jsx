import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getAllMemories, searchMemories, reflectMemories } from '../services/api';
import {
  BrainCircuit,
  Search,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Layers,
  Database,
  Terminal,
} from 'lucide-react';

export default function MemoryExplorer() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  const [reflectQuery, setReflectQuery] = useState(
    'What are the main recurring causes of outages across payment and auth services?'
  );
  const [reflecting, setReflecting] = useState(false);
  const [reflection, setReflection] = useState(null);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const data = await getAllMemories();
      setMemories(data.memories || []);
    } catch (err) {
      console.error('Failed to fetch memories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const data = await searchMemories(searchQuery);
      setSearchResults(data.memories || []);
    } catch (err) {
      console.error('Recall query failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleReflect = async (e) => {
    e.preventDefault();
    setReflecting(true);
    try {
      const data = await reflectMemories(reflectQuery);
      setReflection(data.synthesis);
    } catch (err) {
      console.error('Reflect failed:', err);
    } finally {
      setReflecting(false);
    }
  };

  const activeDisplayMemories = searchResults !== null ? searchResults : memories;

  return (
    <div className="flex-1 flex flex-col bg-[#070a0f] min-h-screen">
      <Navbar title="Hindsight Memory Explorer" />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-teal-950/60 border border-purple-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-700/60 text-purple-300 font-bold text-xs">
                Hindsight Engine
              </span>
              <span className="text-xs text-slate-400">Long-Term Episodic Memory</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              Persistent SRE Knowledge & Memory Bank
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Hindsight retains verified root causes and fixes from past production incidents. When new outages occur, it recalls exact historical resolution patterns.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs shrink-0">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-slate-500 block text-[10px]">RETAINED MEMORIES</span>
              <span className="text-xl font-bold text-teal-400">{memories.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-slate-500 block text-[10px]">SUPPORTED VERBS</span>
              <span className="text-xs font-bold text-purple-300">retain • recall • reflect</span>
            </div>
          </div>
        </div>

        {/* Search / Recall Tester */}
        <div className="p-5 rounded-xl bg-[#0b0f17] border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-200 text-sm">
              <Search className="w-4 h-4 text-purple-400" />
              Test Hindsight Recall Verb (`POST /recall`)
            </div>
            {searchResults !== null && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults(null);
                }}
                className="text-xs text-purple-400 hover:underline"
              >
                Clear Search Filter
              </button>
            )}
          </div>

          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              placeholder="Query Hindsight memory bank (e.g., 'MongoWaitQueueTimeoutError', 'connection pool', 'JWT leak')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={searching}
              className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-lg shadow-purple-900/30 transition-all flex items-center gap-1.5"
            >
              <BrainCircuit className={`w-4 h-4 ${searching ? 'animate-spin' : ''}`} />
              {searching ? 'Recalling...' : 'Execute Recall'}
            </button>
          </form>
        </div>

        {/* Reflect Interactive Console */}
        <div className="p-5 rounded-xl bg-[#0b0f17] border border-teal-800/30 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 font-bold text-slate-200 text-sm">
              <Sparkles className="w-4 h-4 text-teal-400" />
              Test Hindsight Reflect Verb (`POST /reflect`)
            </div>
            <span className="text-[11px] text-teal-400/80">
              Agentic Cross-Incident Knowledge Synthesis
            </span>
          </div>

          <form onSubmit={handleReflect} className="space-y-3">
            <div className="flex gap-3">
              <input
                type="text"
                value={reflectQuery}
                onChange={(e) => setReflectQuery(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                disabled={reflecting}
                className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-slate-950 shadow-lg shadow-teal-900/30 transition-all flex items-center gap-1.5"
              >
                <Terminal className={`w-4 h-4 ${reflecting ? 'animate-spin' : ''}`} />
                {reflecting ? 'Reflecting...' : 'Run Reflection'}
              </button>
            </div>
          </form>

          {reflection && (
            <div className="p-4 rounded-xl bg-slate-950 border border-teal-900/40 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
              {reflection}
            </div>
          )}
        </div>

        {/* Retained Memory Cards Grid */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
            <span>Retained Incident Memories ({activeDisplayMemories.length})</span>
            {searchResults !== null && (
              <span className="text-xs text-purple-400 font-normal">
                Filtered by query: "{searchQuery}"
              </span>
            )}
          </h3>

          {loading ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-purple-400 mx-auto" />
              <p className="text-xs">Fetching Hindsight memory bank...</p>
            </div>
          ) : activeDisplayMemories.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-[#0b0f17] rounded-xl border border-slate-800 space-y-2">
              <Database className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-300">No Memories Retained</p>
              <p className="text-[11px] text-slate-500">
                Resolve an active incident or click "Reset Demo Data" in the top bar to populate Hindsight memories.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeDisplayMemories.map((mem) => (
                <div
                  key={mem.id || mem.incidentId}
                  className="p-5 rounded-xl bg-[#0b0f17] border border-slate-800 hover:border-purple-800/60 transition-all space-y-3 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-purple-300 text-sm">
                        {mem.incidentId}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold">
                        {mem.service}
                      </span>
                    </div>

                    {mem.relevanceScore && (
                      <span className="px-2 py-0.5 rounded bg-teal-950 border border-teal-800/60 text-teal-300 text-[11px] font-bold">
                        {Math.round(mem.relevanceScore * 100)}% Match
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                      Symptoms:
                    </span>
                    <p className="text-xs text-slate-300 mt-0.5">{mem.symptoms}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-purple-400 font-semibold uppercase block">
                      Verified Root Cause:
                    </span>
                    <p className="text-xs text-slate-200">{mem.rootCause}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-teal-950/30 border border-teal-800/40 space-y-1">
                    <span className="text-[10px] text-teal-400 font-semibold uppercase block">
                      Verified Fix Applied:
                    </span>
                    <p className="text-xs text-slate-200">{mem.fix}</p>
                  </div>

                  {mem.verification && (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>{mem.verification}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
