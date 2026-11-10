import React from 'react';
import { Trash2, Sparkles } from 'lucide-react';
import { TimeEntry, Client, Project } from '../types';

interface DailyLogProps {
  entries: TimeEntry[];
  clients: Client[];
  projects: Project[];
  onDeleteEntry: (id: string) => void;
  onGenerateAiSummary?: (id: string) => void;
}

export const DailyLog: React.FC<DailyLogProps> = ({
  entries, clients, projects, onDeleteEntry
}) => {
  return (
    <div className="bg-[#1e293b]/60 border border-slate-800 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Recorded Consulting Activity
        </h3>
        <span className="text-xs text-slate-500">{entries.length} logged entries</span>
      </div>

      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No time entries recorded yet. Start tracking above!
          </div>
        ) : (
          entries.map(e => {
            const client = clients.find(c => c.id === e.clientId);
            const project = projects.find(p => p.id === e.projectId);
            const earnings = (client?.hourlyRate || 0) * e.durationHours;

            return (
              <div 
                key={e.id} 
                className="bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 rounded-xl p-4 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 transition"
              >
                <div className="flex-1 min-w-[280px]">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-100 text-sm">{e.taskName}</span>
                    {e.isBillable && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        Billable
                      </span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {e.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="font-semibold text-slate-300">{client?.company || 'Direct Client'}</span>
                    {project && (
                      <>
                        <span>•</span>
                        <span style={{ color: project.color }}>{project.name}</span>
                      </>
                    )}
                  </div>

                  {e.aiSummary && (
                    <div className="mt-2 text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 font-mono whitespace-pre-line flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{e.aiSummary}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="font-bold text-slate-200 text-sm">{e.durationHours.toFixed(2)} hrs</div>
                    <div className="text-xs text-slate-400">
                      ${earnings.toFixed(2)}
                    </div>
                  </div>

                  <button 
                    onClick={() => onDeleteEntry(e.id)}
                    className="text-slate-500 hover:text-rose-400 transition p-2 rounded-lg hover:bg-rose-500/10"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
