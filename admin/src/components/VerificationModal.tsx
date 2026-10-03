import React, { useState } from 'react';
import { X, QrCode, AlertOctagon, CheckCircle2, Search, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCertNumber?: string;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  defaultCertNumber = '',
}) => {
  const [certInput, setCertInput] = useState<string>(defaultCertNumber);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!certInput.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.certificates.verify(certInput.trim());
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-industrial-surface border border-industrial-borderStrong rounded-lg max-w-xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded hover:bg-industrial-hover"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-orange-950/40 border border-orange-800/40 rounded-lg text-safety-orange">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">
              Statutory Certificate Verification
            </h3>
            <p className="text-xs text-slate-400">
              DGMS & Government of Jharkhand Credential Registry
            </p>
          </div>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleVerify} className="mb-6">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Enter Certificate ID or Scan Token
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              placeholder="e.g. JH-MIN-2026-CCL-08492"
              className="flex-1 bg-industrial-elevated border border-industrial-border rounded px-3 py-2 text-sm text-slate-100 font-mono placeholder:text-slate-500 focus:outline-none focus:border-safety-orange"
            />
            <button
              type="submit"
              disabled={loading || !certInput.trim()}
              className="px-4 py-2 bg-safety-orange hover:bg-safety-orangeDark disabled:opacity-50 text-white font-semibold text-sm rounded flex items-center gap-2 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Verify
            </button>
          </div>
          <div className="flex gap-2 mt-2">
            <span className="text-[11px] text-slate-400">Quick Test Samples:</span>
            <button
              type="button"
              onClick={() => {
                setCertInput('JH-MIN-2026-CCL-08492');
              }}
              className="text-[11px] text-safety-orange hover:underline font-mono"
            >
              JH-MIN-2026-CCL-08492 (Valid)
            </button>
            <span className="text-[11px] text-slate-400">•</span>
            <button
              type="button"
              onClick={() => {
                setCertInput('JH-MIN-2024-CCL-01048');
              }}
              className="text-[11px] text-amber-400 hover:underline font-mono"
            >
              JH-MIN-2024-CCL-01048 (Expiring)
            </button>
          </div>
        </form>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800/40 rounded text-red-300 text-xs mb-4 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
            {error}
          </div>
        )}

        {/* Verification Result Display */}
        {result && (
          <div
            className={`border rounded-lg p-5 ${
              result.is_valid
                ? 'bg-emerald-950/20 border-emerald-800/50'
                : 'bg-red-950/20 border-red-800/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              {result.is_valid ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              ) : (
                <AlertOctagon className="w-7 h-7 text-red-400" />
              )}
              <div>
                <h4
                  className={`text-base font-bold ${
                    result.is_valid ? 'text-emerald-300' : 'text-red-300'
                  }`}
                >
                  {result.is_valid ? 'CERTIFICATE AUTHENTIC & VALID' : 'CERTIFICATE INVALID / EXPIRED'}
                </h4>
                <p className="text-xs text-slate-400">{result.message}</p>
              </div>
            </div>

            {result.certificate && (
              <div className="grid grid-cols-2 gap-3 text-xs bg-industrial-elevated/70 p-3 rounded border border-industrial-border font-mono">
                <div>
                  <span className="text-slate-400 block text-[11px]">Worker Name:</span>
                  <span className="text-slate-200 font-semibold">{result.certificate.worker_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Employee ID:</span>
                  <span className="text-slate-200">{result.certificate.employee_id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Module:</span>
                  <span className="text-slate-200">{result.certificate.module_title}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Organization:</span>
                  <span className="text-slate-200">{result.certificate.organization_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Issue Date:</span>
                  <span className="text-slate-200">{result.certificate.issue_date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Expiry Date:</span>
                  <span className={result.is_valid ? 'text-slate-200' : 'text-red-400 font-bold'}>
                    {result.certificate.expiry_date}
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t border-industrial-border">
                  <span className="text-slate-400 block text-[10px]">Digital Signature Hash:</span>
                  <span className="text-slate-300 text-[10px] truncate block">
                    {result.certificate.digital_signature}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-industrial-elevated hover:bg-industrial-hover text-slate-300 text-xs font-semibold rounded border border-industrial-border"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
