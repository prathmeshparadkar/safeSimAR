import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
  Award,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { EmptyState } from '../components/EmptyState';
import { WorkerDetailModal } from '../components/WorkerDetailModal';

export const WorkersPage: React.FC = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);

  const fetchWorkers = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.workers.list({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        page,
        limit: 10,
      });
      setWorkers(res.workers);
      setPagination(res.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch workers directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWorkers(1);
  };

  return (
    <div className="space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-safety-orange" />
            Industrial Safety Personnel Roster
          </h2>
          <p className="text-xs text-slate-400">
            Registered miners, blast furnace technicians, and ventilation crew in Jharkhand operations.
          </p>
        </div>

        <button
          onClick={() => fetchWorkers(pagination.page)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-industrial-elevated hover:bg-industrial-hover rounded border border-industrial-border text-xs text-slate-300 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh List
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-industrial-surface border border-industrial-border rounded-lg p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by worker name, employee ID, or trade role..."
              className="w-full bg-industrial-elevated border border-industrial-border rounded pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-safety-orange"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-industrial-elevated hover:bg-industrial-hover border border-industrial-border text-xs font-semibold text-slate-200 rounded transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-industrial-elevated border border-industrial-border rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-safety-orange"
          >
            <option value="">All Training Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>

      {/* Workers Table */}
      {loading ? (
        <LoadingSpinner message="Querying worker registry and compliance records..." />
      ) : error ? (
        <ErrorAlert message={error} onRetry={() => fetchWorkers(pagination.page)} />
      ) : workers.length === 0 ? (
        <EmptyState
          title="No workers found"
          message="No workers matched your query or filter parameters."
          actionText="Clear Search Filter"
          onAction={() => {
            setSearch('');
            setStatusFilter('');
            fetchWorkers(1);
          }}
        />
      ) : (
        <div className="bg-industrial-surface border border-industrial-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-industrial-border bg-industrial-elevated text-slate-400">
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Worker ID</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Name</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Organization</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Department</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Training Status</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Latest Score</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Certificate Status</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-border/60">
                {workers.map((w) => (
                  <tr
                    key={w.id}
                    onClick={() => setSelectedWorkerId(w.id)}
                    className="hover:bg-industrial-hover/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-slate-300">
                      {w.employee_id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-100 flex items-center gap-2">
                      {w.name}
                      {w.preferred_language === 'sat' && (
                        <span className="text-[10px] bg-sky-950/40 text-sky-400 border border-sky-800/40 px-1.5 py-0.5 rounded">
                          Santali
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {w.organization_name}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {w.department}
                    </td>
                    <td className="py-3 px-4">
                      {w.training_status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                          <CheckCircle2 className="w-3 h-3" /> COMPLETED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-amber-950/40 text-amber-400 border border-amber-800/40">
                          <Clock className="w-3 h-3" /> PENDING
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      {w.latest_score !== null ? (
                        <span className={w.latest_score >= 80 ? 'text-emerald-400' : 'text-red-400'}>
                          {w.latest_score.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-slate-500 font-normal">No attempt</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {w.certificate_status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-orange-950/40 text-safety-orange border border-orange-800/40">
                          <Award className="w-3 h-3" /> ACTIVE QR
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono text-[11px]">None Issued</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWorkerId(w.id);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-industrial-elevated hover:bg-industrial-border text-slate-300 text-xs rounded border border-industrial-border transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-3 border-t border-industrial-border bg-industrial-elevated/40 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {workers.length} of {pagination.total} personnel records
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchWorkers(pagination.page - 1)}
                className="p-1 rounded bg-industrial-elevated hover:bg-industrial-hover disabled:opacity-40 border border-industrial-border"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchWorkers(pagination.page + 1)}
                className="p-1 rounded bg-industrial-elevated hover:bg-industrial-hover disabled:opacity-40 border border-industrial-border"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Worker Detail Dossier Modal */}
      <WorkerDetailModal
        workerId={selectedWorkerId}
        onClose={() => setSelectedWorkerId(null)}
      />
    </div>
  );
};
