import React from 'react';
import HindsightStatusIndicator from './HindsightStatusIndicator';
import { DatabaseZap, Plus, Sparkles } from 'lucide-react';

export default function Navbar({ title, onOpenNewIncident, onSeedDemo, seeding }) {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0b0f17]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-bold text-slate-100 tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <HindsightStatusIndicator />

        {onSeedDemo && (
          <button
            onClick={onSeedDemo}
            disabled={seeding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-all disabled:opacity-50"
          >
            <DatabaseZap className={`w-3.5 h-3.5 text-amber-400 ${seeding ? 'animate-spin' : ''}`} />
            {seeding ? 'Seeding...' : 'Reset Demo Data'}
          </button>
        )}

        {onOpenNewIncident && (
          <button
            onClick={onOpenNewIncident}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-md shadow-purple-900/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Report Incident
          </button>
        )}
      </div>
    </header>
  );
}
