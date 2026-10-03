import React, { useEffect, useState } from 'react';
import { Award, QrCode, Search, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { VerificationModal } from '../components/VerificationModal';

export const CertificatesPage: React.FC = () => {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [verifyModalOpen, setVerifyModalOpen] = useState<boolean>(false);
  const [selectedCertNo, setSelectedCertNo] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchCerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.certificates.list();
      setCerts(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  const handleOpenVerify = (certNo = '') => {
    setSelectedCertNo(certNo);
    setVerifyModalOpen(true);
  };

  const filteredCerts = certs.filter(
    (c) =>
      c.certificate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.worker_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.module_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-safety-orange" />
            Statutory Safety Credentials & QR Certificates
          </h2>
          <p className="text-xs text-slate-400">
            Cryptographically signed compliance certificates verifiable via physical QR card or digital registry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenVerify()}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-safety-orange hover:bg-safety-orangeDark text-white text-xs font-semibold rounded transition-colors shadow-md"
          >
            <QrCode className="w-4 h-4" />
            Verify Certificate / Scan QR
          </button>
          <button
            onClick={fetchCerts}
            className="p-2 bg-industrial-elevated hover:bg-industrial-hover rounded border border-industrial-border text-slate-300 transition-colors"
            title="Refresh registry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-industrial-surface border border-industrial-border rounded-lg p-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by certificate ID, worker name, or employee ID..."
            className="w-full bg-industrial-elevated border border-industrial-border rounded pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-safety-orange"
          />
        </div>
      </div>

      {/* Certificates Table */}
      {loading ? (
        <LoadingSpinner message="Querying DGMS cryptographic certificate registry..." />
      ) : error ? (
        <ErrorAlert message={error} onRetry={fetchCerts} />
      ) : (
        <div className="bg-industrial-surface border border-industrial-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-industrial-border bg-industrial-elevated text-slate-400">
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Certificate ID</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Worker Name</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Certified Module</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Score</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Issue Date</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Expiry Date</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-border/60">
                {filteredCerts.map((c) => {
                  const isExpiringSoon =
                    new Date(c.expiry_date).getTime() - new Date().getTime() < 45 * 24 * 60 * 60 * 1000;

                  return (
                    <tr key={c.id} className="hover:bg-industrial-hover/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-safety-orange">
                        {c.certificate_number}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-100">
                        {c.worker_name}
                        <span className="block text-[10px] text-slate-400 font-mono font-normal">
                          {c.employee_id} • {c.organization_name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-200">
                        {c.module_title}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        {c.score?.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {c.issue_date}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className={isExpiringSoon ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                          {c.expiry_date}
                          {isExpiringSoon && <span className="ml-1 text-[10px]">(Expiring)</span>}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                          <CheckCircle2 className="w-3 h-3" /> {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenVerify(c.certificate_number)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-industrial-elevated hover:bg-industrial-border text-safety-orange text-xs rounded border border-industrial-border transition-colors font-semibold"
                        >
                          <QrCode className="w-3.5 h-3.5" /> Verify
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      <VerificationModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        defaultCertNumber={selectedCertNo}
      />
    </div>
  );
};
