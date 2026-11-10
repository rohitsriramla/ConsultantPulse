import React from 'react';
import { Play } from 'lucide-react';

interface RecentPillsProps {
  onSelectTask: (taskName: string, clientId?: string, projectId?: string) => void;
}

export const RecentPills: React.FC<RecentPillsProps> = ({ onSelectTask }) => {
  const presets = [
    { label: "AWS Terraform Infrastructure", client: "c1", project: "p1" },
    { label: "OWASP Vulnerability Scan", client: "c2", project: "p2" },
    { label: "Code Review & PR Approvals", client: "c1", project: "p1" },
    { label: "System Architecture Refactoring", client: "c2", project: "p2" },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-400">
      <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px] whitespace-nowrap">Quick Start:</span>
      {presets.map((p, idx) => (
        <button
          key={idx}
          onClick={() => onSelectTask(p.label, p.client, p.project)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-emerald-400 whitespace-nowrap transition"
        >
          <Play className="w-3 h-3" />
          <span>{p.label}</span>
        </button>
      ))}
    </div>
  );
};
