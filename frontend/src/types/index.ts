export interface User {
  id: string;
  email: string;
  fullName: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  hourlyRate: number;
  currency: string;
  createdAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  color: string;
  budgetHours: number;
}

export interface TimeEntry {
  id: string;
  clientId: string;
  projectId?: string;
  taskName: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  isBillable: boolean;
  rawNotes?: string;
  aiSummary?: string;
  status: 'Unbilled' | 'Invoiced' | 'Paid';
}
