import React, { useState } from 'react';
import { Play, Square, ChevronDown } from 'lucide-react';
import { Client, Project } from '../types';

interface TrackerCardProps {
  activeTask: string;
  setActiveTask: (task: string) => void;
  selectedClient: string;
  setSelectedClient: (clientId: string) => void;
  selectedProject: string;
  setSelectedProject: (projectId: string) => void;
  isBillable: boolean;
  setIsBillable: (billable: boolean) => void;
  timerSeconds: number;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  clients: Client[];
  projects: Project[];
}

export const TrackerCard: React.FC<TrackerCardProps> = ({
  activeTask, setActiveTask, selectedClient, setSelectedClient,
  selectedProject, setSelectedProject, isBillable, setIsBillable,
  timerSeconds, isRunning, onStart, onStop, clients, projects
}) => {
  const [selectedCategory, setSelectedCategory] = useState('💻 Development');
  const [categoryOpen, setCategoryOpen] = useState(false);

  const categories = [
    '💻 Development',
    '🏛️ Architecture',
    '🚀 DevOps',
    '🔍 Review',
    '📅 Planning',
    '☕ Meeting'
  ];

  const formatSeconds = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredProjects = projects.filter(p => p.clientId === selectedClient);

  return (
    <div className="bg-[#0b1329] border border-slate-800/80 rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Top Input */}
      <div>
        <input 
          type="text"
          placeholder="What consulting task are you working on right now?"
          value={activeTask}
          onChange={(e) => setActiveTask(e.target.value)}
          className="w-full bg-[#050b18] border border-slate-800 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm shadow-inner"
        />
      </div>

      {/* Selectors Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Client Selector */}
          <div className="relative">
            <select 
              value={selectedClient} 
              onChange={(e) => {
                setSelectedClient(e.target.value);
                const firstProj = projects.find(p => p.clientId === e.target.value);
                setSelectedProject(firstProj ? firstProj.id : '');
              }}
              className="appearance-none bg-[#050b18] border border-slate-800 hover:border-slate-700 rounded-xl pl-3.5 pr-8 py-2.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  🏢 {c.company} (${c.hourlyRate.toFixed(2)}/h)
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3.5 pointer-events-none" />
          </div>

          {/* Project Selector */}
          <div className="relative">
            <select 
              value={selectedProject} 
              onChange={(e) => setSelectedProject(e.target.value)}
              className="appearance-none bg-[#050b18] border border-slate-800 hover:border-slate-700 rounded-xl pl-3.5 pr-8 py-2.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="">• No Project</option>
              {filteredProjects.map(p => (
                <option key={p.id} value={p.id}>• {p.name}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3.5 pointer-events-none" />
          </div>

          {/* Category Dropdown (Dev, DevOps, etc.) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCategoryOpen(!categoryOpen)}
              className="flex items-center gap-2 bg-[#050b18] border-2 border-emerald-500/80 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-900 transition"
            >
              <span>{selectedCategory}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {categoryOpen && (
              <div className="absolute top-11 left-0 z-50 w-44 bg-[#050b18] border border-slate-800 rounded-xl shadow-2xl py-1 overflow-hidden">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCategoryOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2 transition ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* $ Billable Toggle Button */}
          <button 
            type="button"
            onClick={() => setIsBillable(!isBillable)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
              isBillable 
                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-400 shadow-sm shadow-emerald-950' 
                : 'bg-[#050b18] border-slate-800 text-slate-500 hover:border-slate-700'
            }`}
          >
            <span>$</span>
            <span>Billable</span>
          </button>
        </div>

        {/* Digital Clock & Start/Stop Button */}
        <div className="flex items-center gap-4">
          <div className="font-mono text-2xl font-black tracking-wider text-slate-100">
            {formatSeconds(timerSeconds)}
          </div>

          {!isRunning ? (
            <button 
              type="button"
              onClick={onStart}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition transform active:scale-95 text-xs uppercase tracking-wider"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" /> START
            </button>
          ) : (
            <button 
              type="button"
              onClick={onStop}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-lg shadow-rose-600/30 transition transform active:scale-95 animate-pulse text-xs uppercase tracking-wider"
            >
              <Square className="w-3.5 h-3.5 fill-white" /> STOP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};