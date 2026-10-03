import React, { useEffect, useState } from 'react';
import { BookOpen, Flame, Wind, ShieldCheck, RefreshCw, Play } from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { FireDrillSimulatorModal } from '../components/FireDrillSimulatorModal';

export const ModulesPage: React.FC = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [selectedModule, setSelectedModule] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);

  const fetchModules = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.modules.list();
      setModules(res);
      if (res.length > 0) {
        // Fetch full details of the first module as default view
        const first = await api.modules.getById(res[0].id);
        setSelectedModule(first);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch modules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleSelectModule = async (moduleId: string) => {
    try {
      const details = await api.modules.getById(moduleId);
      setSelectedModule(details);
    } catch (err: any) {
      console.error('Error fetching module details:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-safety-orange" />
            Mandated Industrial Safety AR Modules
          </h2>
          <p className="text-xs text-slate-400">
            Vocational training curriculum standardized under DGMS safety circulars for Jharkhand mines & steel plants.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-safety-orange hover:bg-safety-orange-hover rounded font-bold text-xs text-white shadow-md transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Launch AR Fire Drill Simulator
          </button>
          <button
            onClick={fetchModules}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-industrial-elevated hover:bg-industrial-hover rounded border border-industrial-border text-xs text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading safety curriculum and AR scenario pipelines..." />
      ) : error ? (
        <ErrorAlert message={error} onRetry={fetchModules} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Modules List Cards */}
          <div className="lg:col-span-1 space-y-4">
            {modules.map((m) => {
              const isFire = m.category === 'FIRE_EXPLOSION';
              const isSelected = selectedModule?.id === m.id;
              const Icon = isFire ? Flame : Wind;
              const iconColor = isFire ? 'text-red-400' : 'text-amber-400';

              return (
                <div
                  key={m.id}
                  onClick={() => handleSelectModule(m.id)}
                  className={`p-5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-industrial-elevated border-safety-orange ring-1 ring-safety-orange/50 shadow-lg'
                      : 'bg-industrial-surface border-industrial-border hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-industrial-surface rounded-md border border-industrial-border ${iconColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-mono text-slate-400 block">{m.code}</span>
                        <h4 className="text-sm font-bold text-slate-100">{m.title}</h4>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                      {m.is_active ? 'ACTIVE' : 'DEPRECATED'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {m.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-industrial-border/60">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Scenarios</span>
                      <span className="font-mono font-bold text-slate-200">{m.scenario_count} Environments</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Pass Score</span>
                      <span className="font-mono font-bold text-emerald-400">{m.pass_percentage}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Duration</span>
                      <span className="font-mono font-bold text-sky-400">{m.estimated_duration_minutes}m</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Module Deep Dive & Scenarios Breakdown */}
          <div className="lg:col-span-2">
            {selectedModule ? (
              <div className="bg-industrial-surface border border-industrial-border rounded-lg p-6 space-y-6">
                <div className="border-b border-industrial-border pb-4 flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono text-safety-orange font-bold uppercase tracking-wide">
                      Selected Module Blueprint
                    </span>
                    <h3 className="text-lg font-bold text-slate-100 mt-1">{selectedModule.title}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">Code: {selectedModule.code} • v{selectedModule.version}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsSimulatorOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-950/60 hover:bg-red-900/60 border border-red-700/60 text-red-300 rounded text-xs font-semibold shadow-sm transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Test Fire Drill
                    </button>
                    <span className="text-xs font-mono px-3 py-1 rounded bg-industrial-elevated border border-industrial-border text-slate-300">
                      Difficulty: <strong className="text-safety-orange">{selectedModule.difficulty}</strong>
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Curriculum Summary & Objective
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed bg-industrial-elevated p-3.5 rounded border border-industrial-border">
                    {selectedModule.description}
                  </p>
                </div>

                {/* Scenarios and Step List */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    AR Training Scenarios & Vernacular Procedure Steps
                  </h4>

                  <div className="space-y-4">
                    {selectedModule.scenarios?.map((scen: any) => (
                      <div key={scen.id} className="bg-industrial-elevated rounded-lg p-4 border border-industrial-border">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-industrial-surface border border-industrial-border flex items-center justify-center font-mono text-xs font-bold text-safety-orange">
                              {scen.scenario_number}
                            </span>
                            <h5 className="text-sm font-semibold text-slate-100">{scen.title}</h5>
                          </div>
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-red-950/40 text-red-400 border border-red-800/40">
                            {scen.hazard_level}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-3">{scen.description}</p>

                        {/* Steps List */}
                        <div className="space-y-2 mt-3 pt-3 border-t border-industrial-border/60">
                          <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider block">
                            Procedure Steps ({scen.steps?.length || 0})
                          </span>
                          {scen.steps?.map((step: any) => (
                            <div
                              key={step.id}
                              className="p-3 bg-industrial-surface/70 rounded border border-industrial-border/50 text-xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-200">
                                  Step {step.step_order}: {step.title}
                                </span>
                                <span className="text-[11px] font-mono text-safety-orange">
                                  Action: {step.expected_action}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-300">
                                <span className="text-slate-400 font-medium">EN:</span> {step.instruction_en}
                              </div>
                              <div className="text-[11px] text-slate-300">
                                <span className="text-slate-400 font-medium">HI:</span> {step.instruction_hi}
                              </div>
                              <div className="text-[11px] text-sky-300 font-mono">
                                <span className="text-slate-400 font-medium font-sans">SAT:</span> {step.instruction_sat}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Interactive Fire Drill Simulator Modal */}
      <FireDrillSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onAttemptSynced={fetchModules}
      />
    </div>
  );
};
