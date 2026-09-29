import React from 'react';

export default function SeverityBadge({ severity }) {
  let style = 'bg-slate-800 text-slate-300 border-slate-700';

  switch (severity) {
    case 'SEV-1':
      style = 'bg-rose-950/80 text-rose-300 border-rose-700/80 font-bold';
      break;
    case 'SEV-2':
      style = 'bg-amber-950/80 text-amber-300 border-amber-700/80 font-semibold';
      break;
    case 'SEV-3':
      style = 'bg-purple-950/80 text-purple-300 border-purple-700/80';
      break;
    case 'SEV-4':
      style = 'bg-slate-900 text-slate-400 border-slate-800';
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono border ${style}`}>
      {severity}
    </span>
  );
}
