import { useState } from 'react';
import { api } from '../api/client';
import type { User } from '../types';

interface Props {
  onLogin: (user: User) => void;
  onSuccess?: (user: User) => void;
}

export default function LoginView({ onLogin, onSuccess }: Props) {
  const [email, setEmail] = useState('Rohit@realtechservices.co');
  const [password, setPassword] = useState('123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthenticatedUser = (user: User, token?: string) => {
    if (token) localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('devtimer_user', JSON.stringify(user));
    if (onLogin) onLogin(user);
    if (onSuccess) onSuccess(user);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.login(email, password);
      handleAuthenticatedUser(res.user, res.token);
    } catch {
      // Local fallback for pre-filled demo credentials if API backend is in standalone mode
      if (email.trim().toLowerCase() === 'rohit@realtechservices.co' && password === '123') {
        const localUser: User = {
          id: 'usr_rohit_01',
          email: 'Rohit@realtechservices.co',
          fullName: 'Rohit Sriramla'
        };
        handleAuthenticatedUser(localUser);
      } else {
        setError('Invalid credentials. Please use the pre-filled demo account.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] px-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)] w-full max-w-sm p-8 transition-all">

        {/* Brand Header */}
        <div className="flex items-center gap-2.5 mb-7">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <span className="text-xl font-extrabold text-[#0f172a] tracking-tight">Consultant Pulse</span>
        </div>

        <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight mb-1">Sign in</h1>
        <p className="text-sm text-slate-500 mb-6">Track your time, bill with confidence.</p>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl px-3.5 py-2.5 mb-4 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              className="w-full px-3.5 py-2.5 border border-slate-200 hover:border-slate-300 focus:border-slate-900 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border border-slate-200 hover:border-slate-300 focus:border-slate-900 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition shadow-sm font-mono"
            />
          </div>

          <button
            id="login-btn"
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#0f172a] hover:bg-[#1e293b] active:scale-[0.99] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition shadow-sm"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-slate-400 mt-6 text-center">
          Demo credentials are pre-filled above.
        </p>
      </div>
    </div>
  );
}

export { LoginView };