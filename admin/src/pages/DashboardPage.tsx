import React, { useEffect, useState } from 'react';
import {
  Users,
  UserCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Percent,
  Award,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.analytics.getDashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating statutory compliance & AR session metrics..." />;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={fetchMetrics} />;
  }

  const { summary, charts } = data;

  return (
    <div className="space-y-6">
      {/* Top Banner Advisory */}
      <div className="bg-amber-950/20 border border-amber-800/40 rounded-lg p-3.5 flex items-center justify-between text-xs text-amber-200">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>DGMS Quarterly Safety Audit:</strong> Central Coalfields Limited (CCL Ranchi) compliance rate is currently{' '}
            <strong className="text-white">{summary.pass_rate}%</strong>. All workers must complete refresher simulations.
          </span>
        </div>
        <button
          onClick={fetchMetrics}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-industrial-elevated hover:bg-industrial-hover rounded border border-industrial-border text-slate-300 transition-colors"
        >
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {/* 8 Primary KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Workers"
          value={summary.total_workers}
          subtext="Underground & Surface workforce"
          icon={Users}
          badge="100% Enrolled"
          badgeColor="green"
        />

        <StatCard
          label="Active Workers"
          value={summary.active_workers}
          subtext="On-shift roster ready"
          icon={UserCheck}
          badge="Active Roster"
          valueColor="text-emerald-400"
          badgeColor="green"
        />

        <StatCard
          label="Completed Training"
          value={summary.completed_training}
          subtext="Passed at least 1 mandatory drill"
          icon={CheckCircle2}
          valueColor="text-sky-400"
          badgeColor="green"
        />

        <StatCard
          label="Pending Training"
          value={summary.pending_training}
          subtext="Awaiting scheduled AR drill"
          icon={Clock}
          valueColor={summary.pending_training > 0 ? 'text-amber-400' : 'text-slate-200'}
          badge={summary.pending_training > 0 ? 'Action Needed' : 'Nominal'}
          badgeColor={summary.pending_training > 0 ? 'yellow' : 'green'}
        />

        <StatCard
          label="Failed Attempts"
          value={summary.failed_attempts}
          subtext="Require remediation & retry"
          icon={XCircle}
          valueColor={summary.failed_attempts > 0 ? 'text-red-400' : 'text-slate-200'}
          badge={summary.failed_attempts > 0 ? 'Retake Required' : 'Zero'}
          badgeColor={summary.failed_attempts > 0 ? 'red' : 'green'}
        />

        <StatCard
          label="Pass Rate"
          value={`${summary.pass_rate}%`}
          subtext="First-time & retry success benchmark"
          icon={Percent}
          valueColor="text-emerald-400"
          badge="DGMS Met"
          badgeColor="green"
        />

        <StatCard
          label="Valid Certificates"
          value={summary.valid_certificates}
          subtext="Active QR-verifiable credentials"
          icon={Award}
          valueColor="text-safety-orange"
          badge="Cryptographic"
          badgeColor="orange"
        />

        <StatCard
          label="Certificates Expiring Soon"
          value={summary.certificates_expiring_soon}
          subtext="Expiring within 45 days"
          icon={AlertTriangle}
          valueColor={summary.certificates_expiring_soon > 0 ? 'text-amber-400' : 'text-slate-200'}
          badge={summary.certificates_expiring_soon > 0 ? 'Renewal Alert' : 'None'}
          badgeColor={summary.certificates_expiring_soon > 0 ? 'yellow' : 'green'}
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Module Completion */}
        <div className="bg-industrial-surface border border-industrial-border rounded-lg p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-safety-orange" />
              <h3 className="text-sm font-semibold text-slate-100">
                Module Completion & Workforce Coverage
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">AR Core Modules</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.module_completion} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A323D" />
                <XAxis dataKey="code" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#171B21', borderColor: '#3D4857', color: '#F1F5F9', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="enrolled" name="Total Enrolled" fill="#3D4857" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Workers Certified" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Pass/Fail Distribution */}
        <div className="bg-industrial-surface border border-industrial-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-100">Pass / Fail Ratio</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Total Drills</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.pass_fail_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.pass_fail_distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#171B21', borderColor: '#3D4857', color: '#F1F5F9', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Average Score */}
        <div className="bg-industrial-surface border border-industrial-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-semibold text-slate-100">Average Score by Module</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Max: 100%</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.average_score} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A323D" />
                <XAxis dataKey="module" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#171B21', borderColor: '#3D4857', color: '#F1F5F9', fontSize: '12px' }}
                />
                <Bar dataKey="avgScore" name="Avg Score (%)" fill="#38BDF8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Training Trend Over Time */}
        <div className="bg-industrial-surface border border-industrial-border rounded-lg p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-100">Training Session Activity Trend</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">AR Drills Timeline</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.training_trend} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A323D" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#171B21', borderColor: '#3D4857', color: '#F1F5F9', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="attempts" name="Total Drills" stroke="#F97316" strokeWidth={2} />
                <Line type="monotone" dataKey="passed" name="Successful Passes" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 5 / Table: Common Telemetry Mistakes */}
      <div className="bg-industrial-surface border border-industrial-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              High-Frequency Telemetry Mistakes & Penalties (AR Drills)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Real-time AR Feedback</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-industrial-border bg-industrial-elevated/60 text-slate-400">
                <th className="py-2.5 px-4 font-semibold uppercase tracking-wider">Identified Hazard Behavior</th>
                <th className="py-2.5 px-4 font-semibold uppercase tracking-wider">Occurrence Count</th>
                <th className="py-2.5 px-4 font-semibold uppercase tracking-wider">Average Penalty Deducted</th>
                <th className="py-2.5 px-4 font-semibold uppercase tracking-wider">Remedial Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-border/60">
              {charts.common_mistakes.map((m: any, idx: number) => (
                <tr key={idx} className="hover:bg-industrial-hover/50">
                  <td className="py-3 px-4 font-medium text-slate-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    {m.mistake}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">{m.count} Sessions</td>
                  <td className="py-3 px-4 font-mono font-bold text-red-400">-{m.avgPenalty} Points</td>
                  <td className="py-3 px-4 text-slate-400">
                    Reinforce rapid tactile response in simulated smoke ventilation phase.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
