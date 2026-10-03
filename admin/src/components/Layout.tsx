import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  LogOut,
  Menu,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', label: 'Overview & KPIs', icon: LayoutDashboard },
  { path: '/workers', label: 'Workers Directory', icon: Users },
  { path: '/modules', label: 'Training Modules', icon: BookOpen },
  { path: '/certificates', label: 'Certificates & QR', icon: Award },
  { path: '/analytics', label: 'Compliance Analytics', icon: TrendingUp },
];

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getPageTitle = () => {
    const item = navItems.find((n) => n.path === location.pathname);
    return item ? item.label : 'SurakshaAR Compliance Console';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-industrial-bg text-slate-100">
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-industrial-surface border-r border-industrial-border flex flex-col transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-industrial-border">
          <span className="text-[10px] font-bold uppercase tracking-wider text-safety-orange block mb-1">
            DGMS Compliant • Jharkhand
          </span>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            SURAKSHA<span className="text-safety-orange">·AR</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Mining & Manufacturing Safety</p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-semibold tracking-wide transition-colors ${
                  isActive
                    ? 'bg-industrial-elevated text-safety-orange border-l-2 border-safety-orange'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-industrial-hover'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-industrial-border bg-industrial-elevated/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <span className="text-xs font-bold text-slate-200 block truncate">
                {user?.fullName || 'DGMS Administrator'}
              </span>
              <span className="text-[10px] font-mono text-slate-400 block truncate">
                {user?.role || 'SUPER_ADMIN'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-industrial-hover rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-2 border-t border-industrial-border/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              CCL Node Active
            </span>
            <span>v1.0.0</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-industrial-surface border-b border-industrial-border px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 lg:hidden rounded hover:bg-industrial-hover text-slate-400"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-slate-100 tracking-tight">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-industrial-elevated border border-industrial-border rounded font-mono text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>REST API: :5000</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-orange-950/40 border border-orange-800/40 rounded font-mono text-xs text-safety-orange font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>JHARKHAND SECURE</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
