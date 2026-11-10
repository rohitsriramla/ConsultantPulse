import React from 'react';
import { TrackerCard } from '../components/TrackerCard';
import { RecentPills } from '../components/RecentPills';
import { DailyLog } from '../components/DailyLog';
import { Client, Project, TimeEntry } from '../types';

interface TrackViewProps {
  clients: Client[];
  projects: Project[];
  entries: TimeEntry[];
  isRunning: boolean;
  timerSeconds: number;
  activeTask: string;
  setActiveTask: (t: string) => void;
  selectedClient: string;
  setSelectedClient: (c: string) => void;
  selectedProject: string;
  setSelectedProject: (p: string) => void;
  isBillable: boolean;
  setIsBillable: (b: boolean) => void;
  onStart: () => void;
  onStop: () => void;
  onDeleteEntry: (id: string) => void;
}

export const TrackView: React.FC<TrackViewProps> = ({
  clients, projects, entries, isRunning, timerSeconds,
  activeTask, setActiveTask, selectedClient, setSelectedClient,
  selectedProject, setSelectedProject, isBillable, setIsBillable,
  onStart, onStop, onDeleteEntry
}) => {
  return (
    <div className="space-y-6">
      <TrackerCard
        activeTask={activeTask}
        setActiveTask={setActiveTask}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        isBillable={isBillable}
        setIsBillable={setIsBillable}
        timerSeconds={timerSeconds}
        isRunning={isRunning}
        onStart={onStart}
        onStop={onStop}
        clients={clients}
        projects={projects}
      />

      <RecentPills 
        onSelectTask={(task, cId, pId) => {
          setActiveTask(task);
          if (cId) setSelectedClient(cId);
          if (pId) setSelectedProject(pId);
        }}
      />

      <DailyLog 
        entries={entries}
        clients={clients}
        projects={projects}
        onDeleteEntry={onDeleteEntry}
      />
    </div>
  );
};
