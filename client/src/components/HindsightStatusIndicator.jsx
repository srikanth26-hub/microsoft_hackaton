import React, { useEffect, useState } from 'react';
import { getMemoryStatus } from '../services/api';
import { Database, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function HindsightStatusIndicator() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await getMemoryStatus();
      setStatus(data);
    } catch (err) {
      setStatus({ isLive: false, status: 'offline', endpoint: 'http://localhost:8888' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading && !status) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400">
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
        <span>Checking Hindsight...</span>
      </div>
    );
  }

  const isLive = status?.isLive;

  return (
    <div
      onClick={fetchStatus}
      title="Click to re-check Hindsight API server connection"
      className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
        isLive
          ? 'bg-purple-950/40 border-purple-800/60 text-purple-300 hover:bg-purple-900/40'
          : 'bg-teal-950/40 border-teal-800/60 text-teal-300 hover:bg-teal-900/40'
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isLive ? 'bg-purple-400' : 'bg-teal-400'
          }`}
        ></span>
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isLive ? 'bg-purple-500' : 'bg-teal-500'
          }`}
        ></span>
      </span>

      <Database className="w-3.5 h-3.5 opacity-80" />
      <span>
        {isLive ? 'Hindsight Memory (Live REST API)' : 'Hindsight Memory (Local Mode)'}
      </span>
    </div>
  );
}
