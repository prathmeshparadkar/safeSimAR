import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@jharkhandsafety.gov.in');
  const [password, setPassword] = useState('Admin@12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (role: 'admin' | 'trainer') => {
    if (role === 'admin') {
      setEmail('admin@jharkhandsafety.gov.in');
      setPassword('Admin@12345');
    } else {
      setEmail('trainer.anita@cclmining.in');
      setPassword('Trainer@123');
    }
  };

  return (
    <div className="min-h-screen bg-industrial-bg flex flex-col justify-center items-center p-4">
      {/* Decorative Government / Industrial Banner */}
      <div className="w-full max-w-md mb-4 text-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-safety-orange bg-orange-950/40 border border-orange-800/40 px-3 py-1 rounded">
          Govt. of Jharkhand • DGMS Safety Portal
        </span>
      </div>

      <div className="w-full max-w-md bg-industrial-surface border border-industrial-borderStrong rounded-xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-industrial-elevated border border-industrial-border rounded-lg text-safety-orange">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-100">SurakshaAR Console</h2>
            <p className="text-xs text-slate-400">Industrial Vocational Safety Compliance</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800/40 text-red-300 text-xs rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Authorized Official Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@cclmining.in"
                className="w-full bg-industrial-elevated border border-industrial-border rounded pl-10 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-safety-orange"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-industrial-elevated border border-industrial-border rounded pl-10 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-safety-orange font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-safety-orange hover:bg-safety-orangeDark disabled:opacity-50 text-white font-semibold text-sm rounded flex items-center justify-center gap-2 transition-colors mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Sign In to Compliance Console <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Fill for Demonstrations */}
        <div className="mt-6 pt-5 border-t border-industrial-border">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2 text-center">
            Demo Credentials (1-Click Fill)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoCredentials('admin')}
              className="px-2.5 py-1.5 bg-industrial-elevated hover:bg-industrial-hover border border-industrial-border rounded text-[11px] text-slate-300 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3 h-3 text-safety-orange" />
              DGMS Super Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('trainer')}
              className="px-2.5 py-1.5 bg-industrial-elevated hover:bg-industrial-hover border border-industrial-border rounded text-[11px] text-slate-300 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Lead Safety Trainer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
