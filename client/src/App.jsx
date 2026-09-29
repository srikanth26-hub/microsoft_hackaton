import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import IncidentInvestigation from './pages/IncidentInvestigation';
import MemoryExplorer from './pages/MemoryExplorer';
import DemoScenario from './pages/DemoScenario';

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-[#070a0f] text-slate-100 font-sans">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/incident/:id" element={<IncidentInvestigation />} />
          <Route path="/memory" element={<MemoryExplorer />} />
          <Route path="/demo" element={<DemoScenario />} />
        </Routes>
      </div>
    </Router>
  );
}
