import React from 'react';
import { Download, Sparkles, Building, DollarSign } from 'lucide-react';
import { Client, Project, TimeEntry } from '../types';

interface ReportsViewProps {
  clients: Client[];
  projects: Project[];
  entries: TimeEntry[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ clients, entries }) => {
  const totalHours = entries.reduce((a, b) => a + b.durationHours, 0);
  const totalRevenue = entries.reduce((acc, e) => {
    const client = clients.find(c => c.id === e.clientId);
    return acc + (e.isBillable ? e.durationHours * (client?.hourlyRate || 0) : 0);
  }, 0);

  const exportCSV = () => {
    const headers = ["ID", "Task", "Client", "Hours", "Billable", "Rate", "Total", "Date"];
    const rows = entries.map(e => {
      const client = clients.find(c => c.id === e.clientId);
      const rate = client?.hourlyRate || 0;
      return [
        e.id,
        `"${e.taskName.replace(/"/g, '""')}"`,
        `"${client?.company || ''}"`,
        e.durationHours,
        e.isBillable ? 'Yes' : 'No',
        rate,
        (e.durationHours * rate).toFixed(2),
        e.startTime
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DevTimer_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1e293b] border border-slate-800 p-5 rounded-2xl shadow-lg">
          <span className="text-xs uppercase font-semibold text-slate-400">Total Tracked Hours</span>
          <div className="text-3xl font-extrabold text-slate-100 mt-2 font-mono">
            {totalHours.toFixed(1)} hrs
          </div>
        </div>
        <div className="bg-[#1e293b] border border-slate-800 p-5 rounded-2xl shadow-lg">
          <span className="text-xs uppercase font-semibold text-slate-400">Estimated Billable Revenue</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">
            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-[#1e293b] border border-slate-800 p-5 rounded-2xl shadow-lg">
          <span className="text-xs uppercase font-semibold text-slate-400">Active Retainer Clients</span>
          <div className="text-3xl font-extrabold text-teal-400 mt-2 font-mono">{clients.length}</div>
        </div>
      </div>

      {/* Export Action Card */}
      <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-100 text-lg">Billing & Tax Export</h3>
          <p className="text-xs text-slate-400 mt-1">Export formatted raw spreadsheet logs or trigger client invoices.</p>
        </div>
        <button 
          onClick={exportCSV}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-900/30 transition transform active:scale-95 text-sm"
        >
          <Download className="w-4 h-4" /> Download CSV Export
        </button>
      </div>

      {/* Client Breakdown Bar Visualizer */}
      <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h4 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Client Revenue Distribution</h4>
        <div className="space-y-4">
          {clients.map(c => {
            const clientTotal = entries
              .filter(e => e.clientId === c.id)
              .reduce((acc, curr) => acc + curr.durationHours, 0);
            const percent = totalHours > 0 ? (clientTotal / totalHours) * 100 : 0;

            return (
              <div key={c.id} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{c.company}</span>
                  <span className="text-slate-400">{clientTotal.toFixed(1)} hrs ({percent.toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
