const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  getHeaders: () => {
    const token = localStorage.getItem('devtimer_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  },

  async login(email: string, password: string) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Login failed');
    return res.json();
  },

  async getClients() {
    const res = await fetch(`${BASE_URL}/clients`, { headers: this.getHeaders() });
    return res.json();
  },

  async createClient(data: any) {
    const res = await fetch(`${BASE_URL}/clients`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteClient(id: string) {
    const res = await fetch(`${BASE_URL}/clients/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return res.json();
  },

  async getTimeEntries() {
    const res = await fetch(`${BASE_URL}/timeentries`, { headers: this.getHeaders() });
    return res.json();
  },

  async startTimer(payload: any) {
    const res = await fetch(`${BASE_URL}/timer/start`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async stopTimer() {
    const res = await fetch(`${BASE_URL}/timer/stop`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return res.json();
  }
};
