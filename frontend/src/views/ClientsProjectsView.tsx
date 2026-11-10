import React, { useState } from 'react';
import { Building, FolderKanban, Plus, Trash2 } from 'lucide-react';
import { Client, Project, TimeEntry } from '../types';

interface ClientsProjectsViewProps {
  clients: Client[];
  projects: Project[];
  entries: TimeEntry[];
  onAddClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onAddProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

export const ClientsProjectsView: React.FC<ClientsProjectsViewProps> = ({
  clients, projects, entries, onAddClient, onDeleteClient, onAddProject, onDeleteProject
}) => {
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newClientRate, setNewClientRate] = useState(150);
  const [newProjectName, setNewProjectName] = useState('');
  const [projectClientId, setProjectClientId] = useState(clients[0]?.id || '');
  const [budgetHours, setBudgetHours] = useState(40);

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    const client: Client = {
      id: 'c_' + Date.now(),
      company: newCompanyName,
      name: newCompanyName + ' Representative',
      email: `billing@${newCompanyName.toLowerCase().replace(/\s+/g, '')}.com`,
      hourlyRate: Number(newClientRate) || 120,
      currency: 'USD',
      createdAt: new Date().toISOString()
    };
    onAddClient(client);
    setNewCompanyName('');
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !projectClientId) return;
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];
    const proj: Project = {
      id: 'p_' + Date.now(),
      clientId: projectClientId,
      name: newProjectName,
      color: colors[Math.floor(Math.random() * colors.length)],
      budgetHours: Number(budgetHours) || 0
    };
    onAddProject(proj);
    setNewProjectName('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Clients Management */}
      <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
        <h3 className="font-bold text-slate-100 flex items-center gap-2 text-lg">
          <Building className="w-5 h-5 text-emerald-400" /> Client Accounts
        </h3>

        <form onSubmit={handleCreateClient} className="flex gap-2">
          <input 
            type="text"
            placeholder="Company name..."
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          />
          <input 
            type="number"
            placeholder="Rate ($/h)"
            value={newClientRate}
            onChange={(e) => setNewClientRate(Number(e.target.value))}
            className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          />
          <button 
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 transition"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>

        <div className="space-y-3">
          {clients.map(c => (
            <div key={c.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-semibold text-slate-200">{c.company}</div>
                <div className="text-xs text-slate-400">{c.email}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-emerald-400 font-bold">${c.hourlyRate}/hr</span>
                <button 
                  onClick={() => onDeleteClient(c.id)}
                  className="text-slate-500 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects Management */}
      <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
        <h3 className="font-bold text-slate-100 flex items-center gap-2 text-lg">
          <FolderKanban className="w-5 h-5 text-indigo-400" /> Active Projects
        </h3>

        <form onSubmit={handleCreateProject} className="flex flex-wrap gap-2">
          <select
            value={projectClientId}
            onChange={(e) => setProjectClientId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {clients.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
          </select>
          <input 
            type="text"
            placeholder="Project name..."
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="flex-1 min-w-[140px] bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
          <input 
            type="number"
            placeholder="Hours"
            value={budgetHours}
            onChange={(e) => setBudgetHours(Number(e.target.value))}
            className="w-20 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
          <button 
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 transition"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>

        <div className="space-y-3">
          {projects.map(p => {
            const client = clients.find(c => c.id === p.clientId);
            return (
              <div key={p.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-slate-200 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
                    {p.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Client: {client?.company} • Budget: {p.budgetHours} hrs
                  </div>
                </div>
                <button 
                  onClick={() => onDeleteProject(p.id)}
                  className="text-slate-500 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
