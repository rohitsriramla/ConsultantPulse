import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TrackView } from './views/TrackView';
import { TimesheetView } from './views/TimesheetView';
import { ReportsView } from './views/ReportsView';
import { ClientsProjectsView } from './views/ClientsProjectsView';
import { LoginView } from './views/LoginView';
import { Client, Project, TimeEntry } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; fullName: string } | null>(() => {
    const saved = localStorage.getItem('devtimer_user') || localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<'track' | 'timesheet' | 'reports' | 'clients'>('track');

  // Client and Project states with local persistence
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('devtimer_clients');
    return saved ? JSON.parse(saved) : [
      { id: 'c1', name: 'Billing Dept', company: 'realtech', email: 'billing@realtech.com', hourlyRate: 150, currency: 'USD', createdAt: new Date().toISOString() }
    ];
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('devtimer_projects');
    return saved ? JSON.parse(saved) : [
      { id: 'p1', clientId: 'c1', name: 'Cloud Migration & Architecture', color: '#3b82f6', budgetHours: 40 }
    ];
  });

  const [entries, setEntries] = useState<TimeEntry[]>(() => {
    const saved = localStorage.getItem('devtimer_entries');
    return saved ? JSON.parse(saved) : [
      {
        id: 'e1',
        clientId: 'c1',
        projectId: 'p1',
        taskName: 'Marketing',
        startTime: new Date(Date.now() - 0.05 * 3600 * 1000).toISOString(),
        endTime: new Date().toISOString(),
        durationHours: 0.05,
        isBillable: true,
        rawNotes: 'Marketing deliverables and strategy session.',
        aiSummary: '• Completed Marketing',
        status: 'Unbilled'
      }
    ];
  });

  // Active Timer State
  const [isRunning, setIsRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const [activeTask, setActiveTask] = useState('');
  const [selectedClient, setSelectedClient] = useState(clients[0]?.id || '');
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');
  const [isBillable, setIsBillable] = useState(true);

  // Synchronization with LocalStorage
  useEffect(() => { localStorage.setItem('devtimer_clients', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem('devtimer_projects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('devtimer_entries', JSON.stringify(entries)); }, [entries]);

  // Live Timer Loop
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimerSeconds(Math.floor((Date.now() - (timerStartTime || Date.now())) / 1000));
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, timerStartTime]);

  const handleStart = () => {
    setIsRunning(true);
    setTimerStartTime(Date.now());
    setTimerSeconds(0);
  };

  const handleStop = () => {
    if (!isRunning || !timerStartTime) return;
    const durHours = Math.max(0.05, Math.round(((Date.now() - timerStartTime) / 3600000) * 100) / 100);
    const newEntry: TimeEntry = {
      id: 'e_' + Date.now(),
      clientId: selectedClient,
      projectId: selectedProject || undefined,
      taskName: activeTask || 'Marketing',
      startTime: new Date(timerStartTime).toISOString(),
      endTime: new Date().toISOString(),
      durationHours: durHours,
      isBillable,
      rawNotes: 'Logged via live consultant tracker.',
      aiSummary: `• Completed ${activeTask || 'ad-hoc engineering deliverables'}`,
      status: 'Unbilled'
    };

    setEntries([newEntry, ...entries]);
    setIsRunning(false);
    setTimerSeconds(0);
    setTimerStartTime(null);
    setActiveTask('');
  };

  const handleLogout = () => {
    localStorage.removeItem('devtimer_user');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  // If unauthenticated, show the Sign-in view
  if (!currentUser) {
    return <LoginView onLogin={(user) => setCurrentUser(user)} onSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col font-sans">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {activeTab === 'track' && (
          <TrackView
            clients={clients}
            projects={projects}
            entries={entries}
            isRunning={isRunning}
            timerSeconds={timerSeconds}
            activeTask={activeTask}
            setActiveTask={setActiveTask}
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
            isBillable={isBillable}
            setIsBillable={setIsBillable}
            onStart={handleStart}
            onStop={handleStop}
            onDeleteEntry={(id) => setEntries(entries.filter(e => e.id !== id))}
          />
        )}

        {activeTab === 'timesheet' && (
          <TimesheetView 
            clients={clients} 
            projects={projects} 
            entries={entries}
            onAddEntry={(newEntry) => setEntries([newEntry, ...entries])}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView 
            clients={clients} 
            projects={projects} 
            entries={entries} 
          />
        )}

        {activeTab === 'clients' && (
          <ClientsProjectsView 
            clients={clients}
            projects={projects}
            entries={entries}
            onAddClient={(c) => setClients([...clients, c])}
            onDeleteClient={(id) => setClients(clients.filter(c => c.id !== id))}
            onAddProject={(p) => setProjects([...projects, p])}
            onDeleteProject={(id) => setProjects(projects.filter(p => p.id !== id))}
          />
        )}
      </main>
    </div>
  );
}