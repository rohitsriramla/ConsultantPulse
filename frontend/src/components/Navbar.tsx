import { useState } from 'react';
import { Clock, Play, Calendar, BarChart3, FolderKanban, LogOut } from 'lucide-react';
import type { User } from '../types';

interface Props {
  activeTab?: 'track' | 'timesheet' | 'reports' | 'clients';
  setActiveTab?: (tab: 'track' | 'timesheet' | 'reports' | 'clients') => void;
  user: User;
  onLogout: () => void;
}

export const Navbar = ({ activeTab = 'track', setActiveTab, user, onLogout }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map(w => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'RS';

  const navItems = [
    { key: 'track' as const, label: 'Track', icon: Play },
    { key: 'timesheet' as const, label: 'Timesheet', icon: Calendar },
    { key: 'reports' as const, label: 'Reports', icon: BarChart3 },
    { key: 'clients' as const, label: 'Clients & Projects', icon: FolderKanban },
  ];

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0f172a] px-6 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        
        {/* Left: Brand + Navigation Tabs */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
              <Clock className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-center">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Consultant Pulse
              </span>
              <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase tracking-widest border border-slate-700">
                Pro
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab && setActiveTab(key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition ${
                  activeTab === key
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Right: User Profile & Direct / Dropdown Logout */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              id="user-menu-btn"
              type="button"
              onClick={() => setMenuOpen(o => !o)}
              className="flex items-center gap-3 pl-3 border-l border-slate-800 hover:opacity-90 transition text-left"
            >
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200 leading-tight">
                  {user.fullName}
                </span>
                <span className="text-[11px] text-slate-400 leading-tight">
                  {user.email}
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-emerald-400 shadow-inner select-none">
                {initials}
              </div>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-44 bg-[#0a1122] border border-slate-800 rounded-xl shadow-2xl z-20 py-1.5">
                  <div className="px-3.5 py-2 border-b border-slate-800/80 sm:hidden">
                    <p className="text-xs font-semibold text-slate-200">{user.fullName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <button
                    id="logout-dropdown-btn"
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 font-semibold transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log out</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            id="logout-btn"
            type="button"
            onClick={onLogout}
            title="Sign out of Consultant Pulse"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 text-xs font-medium transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log out</span>
          </button>
        </div>

      </div>
    </header>
  );
};

export default Navbar;