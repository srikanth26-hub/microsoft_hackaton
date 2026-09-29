import React from 'react';
import { AlertCircle, Search, CheckCircle2, Wrench } from 'lucide-react';

export default function StatusBadge({ status }) {
  let style = 'bg-slate-800 text-slate-300 border-slate-700';
  let Icon = Search;

  switch (status) {
    case 'Investigating':
      style = 'bg-rose-950/60 text-rose-300 border-rose-800/60 shadow-sm shadow-rose-950/30';
      Icon = AlertCircle;
      break;
    case 'Identified':
      style = 'bg-amber-950/60 text-amber-300 border-amber-800/60';
      Icon = Search;
      break;
    case 'Resolving':
      style = 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60';
      Icon = Wrench;
      break;
    case 'Resolved':
      style = 'bg-teal-950/60 text-teal-300 border-teal-800/60';
      Icon = CheckCircle2;
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${style}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}
