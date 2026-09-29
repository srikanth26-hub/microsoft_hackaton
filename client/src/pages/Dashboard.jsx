import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import NewIncidentModal from '../components/NewIncidentModal';
import { getIncidents, createIncident, seedDemoData } from '../services/api';
import {
  ShieldAlert,
  CheckCircle2,
  BrainCircuit,
  Search,
  Filter,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Clock,
  Layers,
} from 'lucide-react';

export default function Dashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const navigate = useNavigate();

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const data = await getIncidents({
        status: statusFilter,
        service: serviceFilter,
        severity: severityFilter,
      });
      setIncidents(data.incidents || []);
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [statusFilter, serviceFilter, severityFilter]);

  const handleCreateIncident = async (formData) => {
    const data = await createIncident(formData);
    fetchIncidents();
    if (data.incident?.incidentId) {
      navigate(`/incident/${data.incident.incidentId}`);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedDemoData();
      await fetchIncidents();
    } catch (err) {
      console.error('Failed to seed demo data:', err);
    } finally {
      setSeeding(false);
    }
  };

  // Metrics calculation
  const totalCount = incidents.length;
  const activeCount = incidents.filter((i) => i.status !== 'Resolved').length;
  const resolvedCount = incidents.filter((i) => i.status === 'Resolved').length;
  const recalledCount = incidents.filter(
    (i) => i.recalledMemories && i.recalledMemories.length > 0
  ).length;

  const filteredIncidents = incidents.filter((inc) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      inc.incidentId.toLowerCase().includes(term) ||
      inc.title.toLowerCase().includes(term) ||
      inc.service.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex-1 flex flex-col bg-[#070a0f] min-h-screen">
      <Navbar
        title="Incident Operations Dashboard"
        onOpenNewIncident={() => setIsModalOpen(true)}
        onSeedDemo={handleSeed}
        seeding={seeding}
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#0b0f17] border border-slate-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Incidents</p>
              <h3 className="text-2xl font-bold text-slate-100 mt-1">{totalCount}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Recorded in telemetry</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0b0f17] border border-slate-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Active Outages</p>
              <h3 className="text-2xl font-bold text-rose-400 mt-1">{activeCount}</h3>
              <p className="text-[11px] text-rose-300/60 mt-0.5">Requires SRE attention</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0b0f17] border border-slate-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Resolved & Retained</p>
              <h3 className="text-2xl font-bold text-teal-400 mt-1">{resolvedCount}</h3>
              <p className="text-[11px] text-teal-300/60 mt-0.5">Lessons stored in memory</p>
            </div>
            <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-800/40 text-teal-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0b0f17] border border-slate-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Hindsight Recall Rate</p>
              <h3 className="text-2xl font-bold text-indigo-400 mt-1">
                {totalCount > 0 ? Math.round((recalledCount / totalCount) * 100) : 0}%
              </h3>
              <p className="text-[11px] text-indigo-300/60 mt-0.5">Historical matches found</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-indigo-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="p-4 rounded-xl bg-[#0b0f17] border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 w-full md:w-auto">
            {['all', 'Investigating', 'Resolved'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                  statusFilter === tab
                    ? 'bg-slate-800 text-purple-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'all' ? 'All Incidents' : tab}
              </button>
            ))}
          </div>

          {/* Search & Select Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search incident ID or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Services</option>
              <option value="payment-service">payment-service</option>
              <option value="auth-service">auth-service</option>
              <option value="inventory-api">inventory-api</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Severities</option>
              <option value="SEV-1">SEV-1</option>
              <option value="SEV-2">SEV-2</option>
              <option value="SEV-3">SEV-3</option>
            </select>
          </div>
        </div>

        {/* Incident Table */}
        <div className="rounded-xl bg-[#0b0f17] border border-slate-800/80 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-400" />
              <p className="text-xs">Loading incident telemetry...</p>
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-300">No Incidents Found</h4>
              <p className="text-xs text-slate-500">
                No incidents match the active filter criteria. Click "Reset Demo Data" or "Report Incident" to add test events.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">ID</th>
                    <th className="px-5 py-3.5">Title & Trigger</th>
                    <th className="px-5 py-3.5">Service & Env</th>
                    <th className="px-5 py-3.5">Severity</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Hindsight Memory</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredIncidents.map((inc) => {
                    const hasMemory = inc.recalledMemories && inc.recalledMemories.length > 0;
                    return (
                      <tr
                        key={inc.incidentId}
                        onClick={() => navigate(`/incident/${inc.incidentId}`)}
                        className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-4 font-mono font-bold text-slate-200">
                          {inc.incidentId}
                        </td>
                        <td className="px-5 py-4 max-w-xs">
                          <div className="font-semibold text-slate-100 truncate">{inc.title}</div>
                          {inc.trigger && (
                            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                              Trigger: {inc.trigger}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-200">{inc.service}</div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wide">
                            {inc.environment}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <SeverityBadge severity={inc.severity} />
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={inc.status} />
                        </td>
                        <td className="px-5 py-4">
                          {hasMemory ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/50 text-[11px]">
                              <BrainCircuit className="w-3 h-3 text-purple-400" />
                              {inc.recalledMemories.length} Historical Matches
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">No prior matches</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/incident/${inc.incidentId}`);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-purple-900/40 text-purple-300 hover:text-purple-200 border border-slate-700/80 transition-all font-semibold"
                          >
                            Investigate
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <NewIncidentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateIncident}
      />
    </div>
  );
}
