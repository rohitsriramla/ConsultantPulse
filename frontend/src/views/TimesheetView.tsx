import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, X } from 'lucide-react';
import { Client, Project, TimeEntry } from '../types';

interface TimesheetViewProps {
  clients: Client[];
  projects: Project[];
  entries: TimeEntry[];
  onAddEntry?: (entry: TimeEntry) => void;
}

export const TimesheetView: React.FC<TimesheetViewProps> = ({ clients, projects, entries, onAddEntry }) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Modal State for "Log Hours to Grid"
  const [modalOpen, setModalOpen] = useState(false);
  const [modalClient, setModalClient] = useState<Client | null>(null);
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const [modalDay, setModalDay] = useState('');
  const [modalDateStr, setModalDateStr] = useState('2026-11-03');
  const [hoursInput, setHoursInput] = useState('2.0');
  const [noteInput, setNoteInput] = useState('Timesheet Block Session');
  const [isBillableInput, setIsBillableInput] = useState(true);

  // Dynamic cell hours mapped by clientId + day
  const [gridHours, setGridHours] = useState<Record<string, number>>({
    'c1-Mon': 3.5,
    'c1-Tue': 4.0,
    'c1-Thu': 2.0,
    'c2-Mon': 2.5,
    'c2-Wed': 3.0,
  });

  const days = [
    { key: 'Mon', label: 'Mon', date: '2026-11-02' },
    { key: 'Tue', label: 'Tue', date: '2026-11-03' },
    { key: 'Wed', label: 'Wed', date: '2026-11-04' },
    { key: 'Thu', label: 'Thu', date: '2026-11-05' },
    { key: 'Fri', label: 'Fri', date: '2026-11-06' },
    { key: 'Sat', label: 'Sat', date: '2026-11-07' },
    { key: 'Sun', label: 'Sun', date: '2026-11-08' }
  ];

  const handleOpenCell = (client: Client, dayKey: string, dateStr: string) => {
    const proj = projects.find(p => p.clientId === client.id) || null;
    const existing = gridHours[`${client.id}-${dayKey}`] || 0;
    setModalClient(client);
    setModalProject(proj);
    setModalDay(dayKey);
    setModalDateStr(dateStr);
    setHoursInput(existing > 0 ? existing.toFixed(1) : '2.0');
    setNoteInput('Timesheet Block Session');
    setIsBillableInput(true);
    setModalOpen(true);
  };

  const handleSaveHours = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalClient) return;

    const val = parseFloat(hoursInput) || 0;
    const key = `${modalClient.id}-${modalDay}`;
    setGridHours(prev => ({ ...prev, [key]: val }));

    if (onAddEntry && val > 0) {
      onAddEntry({
        id: 'ts_' + Date.now(),
        clientId: modalClient.id,
        projectId: modalProject?.id,
        taskName: noteInput || 'Timesheet Block Session',
        startTime: `${modalDateStr}T09:00:00.000Z`,
        endTime: `${modalDateStr}T11:00:00.000Z`,
        durationHours: val,
        isBillable: isBillableInput,
        rawNotes: noteInput,
        aiSummary: `• Logged ${val}h via weekly timesheet grid`,
        status: 'Unbilled'
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="bg-[#0b1329] border border-slate-800/80 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Weekly Timesheet Matrix</h2>
          <p className="text-xs text-slate-400 mt-1">Click any cell to log or adjust consulting hours directly.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#050b18] border border-slate-800 rounded-xl p-1">
            <button 
              onClick={() => setWeekOffset(w => w - 1)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-slate-300">
              {weekOffset === 0 ? "Current Week" : `Week ${weekOffset > 0 ? `+${weekOffset}` : weekOffset}`}
            </span>
            <button 
              onClick={() => setWeekOffset(w => w + 1)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={() => setIsSubmitted(true)}
            disabled={isSubmitted}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              isSubmitted 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default' 
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSubmitted ? 'Submitted for Approval' : 'Submit Timesheet'}
          </button>
        </div>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
              <th className="pb-3 px-3">Client / Project</th>
              {days.map(d => (
                <th key={d.key} className="pb-3 text-center px-2">{d.label}</th>
              ))}
              <th className="pb-3 text-right px-3">Total Hours</th>
              <th className="pb-3 text-right px-3">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {clients.map(c => {
              const clientProj = projects.find(p => p.clientId === c.id);
              let totalClientHours = 0;

              return (
                <tr key={c.id} className="hover:bg-slate-900/30 transition">
                  <td className="py-4 px-3">
                    <div className="font-semibold text-slate-200">{c.company}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>${c.hourlyRate}/hr</span>
                      {clientProj && (
                        <>
                          <span>•</span>
                          <span style={{ color: clientProj.color }}>{clientProj.name}</span>
                        </>
                      )}
                    </div>
                  </td>

                  {days.map(d => {
                    const h = gridHours[`${c.id}-${d.key}`] || 0;
                    totalClientHours += h;

                    return (
                      <td key={d.key} className="py-4 text-center px-1">
                        <button
                          type="button"
                          onClick={() => handleOpenCell(c, d.key, d.date)}
                          className={`w-14 py-2 rounded-lg text-xs font-mono font-semibold transition border ${
                            h > 0
                              ? 'bg-slate-900/90 border-slate-700 text-slate-100 hover:border-emerald-500 hover:text-emerald-400'
                              : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-900/50 hover:border-slate-800 hover:text-slate-400'
                          }`}
                          title={`Click to edit hours for ${d.label}[cite: 5]`}
                        >
                          {h > 0 ? `${h.toFixed(1)}h` : '-'}
                        </button>
                      </td>
                    );
                  })}

                  <td className="py-4 text-right px-3 font-bold text-emerald-400 font-mono">
                    {totalClientHours.toFixed(1)}h
                  </td>
                  <td className="py-4 text-right px-3 font-bold text-slate-200 font-mono">
                    ${(totalClientHours * c.hourlyRate).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Log Hours to Grid Modal */}
      {modalOpen && modalClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm bg-[#050b18] border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-5 animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100">Log Hours to Grid</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {modalClient.company} • {modalProject?.name || 'Consulting'} ({modalDateStr})
                </p>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveHours} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Hours to record
                </label>
                <input 
                  type="number"
                  step="0.25"
                  value={hoursInput}
                  onChange={(e) => setHoursInput(e.target.value)}
                  className="w-full bg-[#0a1122] border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Task Note / Description
                </label>
                <input 
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Task description..."
                  className="w-full bg-[#0a1122] border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox"
                  id="modalBillable"
                  checked={isBillableInput}
                  onChange={(e) => setIsBillableInput(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="modalBillable" className="text-xs font-medium text-slate-200 cursor-pointer">
                  Billable
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md transition"
                >
                  Add Hours
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};