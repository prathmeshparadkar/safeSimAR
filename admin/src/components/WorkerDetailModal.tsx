import React, { useEffect, useState } from 'react';
import { X, User, Award, AlertTriangle, Clock, CheckCircle2, XCircle, Globe, Phone } from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorAlert } from './ErrorAlert';

interface WorkerDetailModalProps {
  workerId: string | null;
  onClose: () => void;
}

export const WorkerDetailModal: React.FC<WorkerDetailModalProps> = ({ workerId, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'attempts' | 'certificates' | 'mistakes'>('profile');

  useEffect(() => {
    if (!workerId) return;

    setLoading(true);
    setError(null);

    api.workers
      .getById(workerId)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load worker details');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [workerId]);

  if (!workerId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-industrial-surface border border-industrial-borderStrong rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-industrial-border flex items-center justify-between bg-industrial-elevated/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-industrial-elevated rounded-lg text-safety-orange border border-industrial-border">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                {loading ? 'Worker Dossier' : data?.profile?.name}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {data?.profile?.employee_id} • {data?.profile?.organization_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-industrial-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-industrial-border bg-industrial-elevated/20 px-5 gap-6 text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-safety-orange text-safety-orange'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Profile & Shift
          </button>
          <button
            onClick={() => setActiveTab('attempts')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'attempts'
                ? 'border-safety-orange text-safety-orange'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Training Attempts ({data?.attempts?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'certificates'
                ? 'border-safety-orange text-safety-orange'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Certificates ({data?.certificates?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('mistakes')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'mistakes'
                ? 'border-safety-orange text-safety-orange'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Mistakes Telemetry ({data?.mistakes?.length || 0})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <LoadingSpinner message="Fetching worker record and telemetry logs..." />
          ) : error ? (
            <ErrorAlert message={error} />
          ) : data ? (
            <>
              {/* TAB 1: Profile */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-industrial-elevated rounded border border-industrial-border">
                      <span className="text-[11px] text-slate-400 uppercase tracking-wide block mb-1">
                        Trade / Department
                      </span>
                      <span className="text-sm font-semibold text-slate-100">
                        {data.profile.department}
                      </span>
                    </div>

                    <div className="p-3 bg-industrial-elevated rounded border border-industrial-border">
                      <span className="text-[11px] text-slate-400 uppercase tracking-wide block mb-1">
                        Assigned Shift
                      </span>
                      <span className="text-sm font-semibold text-amber-400 font-mono">
                        {data.profile.shift}
                      </span>
                    </div>

                    <div className="p-3 bg-industrial-elevated rounded border border-industrial-border">
                      <span className="text-[11px] text-slate-400 uppercase tracking-wide block mb-1">
                        Safety Clearance Level
                      </span>
                      <span className="text-sm font-semibold text-safety-orange font-mono">
                        {data.profile.current_safety_level}
                      </span>
                    </div>

                    <div className="p-3 bg-industrial-elevated rounded border border-industrial-border">
                      <span className="text-[11px] text-slate-400 uppercase tracking-wide block mb-1">
                        Preferred Language
                      </span>
                      <span className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-sky-400" />
                        {data.profile.preferred_language === 'sat'
                          ? 'Santali (ᱥᱟᱱᱛᱟᱲᱤ)'
                          : data.profile.preferred_language === 'hi'
                          ? 'Hindi (हिन्दी)'
                          : 'English'}
                      </span>
                    </div>

                    <div className="p-3 bg-industrial-elevated rounded border border-industrial-border">
                      <span className="text-[11px] text-slate-400 uppercase tracking-wide block mb-1">
                        Completed Drills
                      </span>
                      <span className="text-sm font-semibold text-emerald-400 font-mono">
                        {data.profile.total_trainings_completed} Modules
                      </span>
                    </div>

                    <div className="p-3 bg-industrial-elevated rounded border border-industrial-border">
                      <span className="text-[11px] text-slate-400 uppercase tracking-wide block mb-1">
                        Account Status
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 font-mono">
                        {data.profile.is_active ? 'ACTIVE WORKER' : 'SUSPENDED'}
                      </span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="p-4 bg-industrial-elevated rounded border border-industrial-border">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                      Emergency Contact & Logistics
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Direct Phone:</span>
                        <span className="font-mono text-slate-200">{data.profile.phone || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Emergency Kin Contact:</span>
                        <span className="font-mono text-slate-200 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-safety-orange" />
                          {data.profile.emergency_contact || 'None registered'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Mine / Plant Location:</span>
                        <span className="text-slate-200">{data.profile.district}, Jharkhand</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Enrolled Date:</span>
                        <span className="text-slate-200 font-mono">{data.profile.created_at}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Attempts & Scores */}
              {activeTab === 'attempts' && (
                <div className="space-y-4">
                  {data.attempts.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      No training attempts recorded for this worker yet.
                    </div>
                  ) : (
                    data.attempts.map((att: any) => (
                      <div
                        key={att.id}
                        className="p-4 bg-industrial-elevated rounded-lg border border-industrial-border flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-slate-400">{att.module_code}</span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-sm font-semibold text-slate-100">{att.scenario_title}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {Math.floor(att.duration_seconds / 60)}m {att.duration_seconds % 60}s
                            </span>
                            <span>•</span>
                            <span className="font-mono">{att.start_time?.slice(0, 16).replace('T', ' ')}</span>
                            {att.is_offline ? (
                              <span className="px-1.5 py-0.5 bg-amber-950/40 text-amber-400 border border-amber-800/40 rounded text-[10px]">
                                OFFLINE SYNCED
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-bold font-mono text-slate-100">
                            {att.score?.toFixed(1)}%
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded font-mono border ${
                              att.passed
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                                : 'bg-red-950/40 text-red-400 border-red-800/40'
                            }`}
                          >
                            {att.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {att.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: Certificates */}
              {activeTab === 'certificates' && (
                <div className="space-y-4">
                  {data.certificates.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      No certificates currently issued for this worker.
                    </div>
                  ) : (
                    data.certificates.map((cert: any) => (
                      <div
                        key={cert.id}
                        className="p-4 bg-industrial-elevated rounded-lg border border-industrial-border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-safety-orange" />
                            <span className="text-sm font-bold text-slate-100 font-mono">
                              {cert.certificate_number}
                            </span>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 font-mono">
                            {cert.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mb-3">{cert.module_title}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-industrial-surface/50 p-2.5 rounded border border-industrial-border/60">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Issued:</span>
                            <span className="text-slate-200">{cert.issue_date}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Expiry:</span>
                            <span className="text-slate-200">{cert.expiry_date}</span>
                          </div>
                          <div className="col-span-2 pt-1 border-t border-industrial-border/40">
                            <span className="text-slate-400 block text-[10px]">Digital Signature:</span>
                            <span className="text-[10px] text-slate-400 truncate block">
                              {cert.digital_signature}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: Mistakes Telemetry */}
              {activeTab === 'mistakes' && (
                <div className="space-y-4">
                  {data.mistakes.length === 0 ? (
                    <div className="p-6 text-center text-emerald-400 bg-emerald-950/10 border border-emerald-900/30 rounded-lg text-xs">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-80" />
                      Zero critical safety mistakes logged for this worker. Flawless procedure execution!
                    </div>
                  ) : (
                    data.mistakes.map((m: any) => (
                      <div
                        key={m.id}
                        className="p-3.5 bg-industrial-elevated rounded border border-red-900/30 flex items-start justify-between"
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                          <div>
                            <h5 className="text-xs font-semibold text-slate-200">
                              {m.action_type.replace(/_/g, ' ')}
                            </h5>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Step: {m.step_title || m.object_interacted}
                            </p>
                            {m.details?.reason && (
                              <p className="text-[11px] text-red-300/80 mt-1 italic">
                                &quot;{m.details.reason}&quot;
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold text-red-400">
                            -{m.penalty_applied} PTS
                          </span>
                          <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                            {(m.reaction_time_ms / 1000).toFixed(1)}s reaction
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-industrial-border bg-industrial-elevated/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-industrial-elevated hover:bg-industrial-hover text-slate-200 text-xs font-semibold rounded border border-industrial-border transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
