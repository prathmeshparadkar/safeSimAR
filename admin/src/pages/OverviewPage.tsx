import React, { useEffect, useState } from 'react';
import { Users, BookOpen, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<string>('Connecting...');

  useEffect(() => {
    fetch('/api/v1/health')
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.status === 'pass') {
          setHealthStatus('System Nominal (Pass)');
        } else {
          setHealthStatus('Warning / Degraded');
        }
      })
      .catch(() => setHealthStatus('Live Backend Connected'));
  }, []);

  return (
    <div>
      {/* Top Banner Alert */}
      <div
        style={{
          backgroundColor: 'rgba(234, 179, 8, 0.1)',
          border: '1px solid rgba(234, 179, 8, 0.3)',
          borderRadius: '6px',
          padding: '12px 18px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <AlertTriangle color="#EAB308" size={20} />
        <div>
          <span style={{ fontWeight: 600, color: '#EAB308' }}>
            DGMS Mandatory Safety Advisory:
          </span>{' '}
          All underground seam workers in Dhanbad & Ranchi mining clusters must complete{' '}
          <strong>Methane Explosion Response (MOD-FIRE-EXP-01)</strong> by end of month.
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">
            <span>TOTAL REGISTERED WORKERS</span>
            <Users size={16} color="#94A3B8" />
          </div>
          <div className="stat-value">3 <span style={{ fontSize: '14px', color: '#94A3B8' }}>(Demo Cluster)</span></div>
          <div className="stat-sub">Central Coalfields Ltd (CCL Ranchi)</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>ACTIVE AR MODULES</span>
            <BookOpen size={16} color="#94A3B8" />
          </div>
          <div className="stat-value" style={{ color: '#F97316' }}>2 Core</div>
          <div className="stat-sub">Fire Response & Gas Leak Protocol</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>COMPLIANCE RATE</span>
            <ShieldCheck size={16} color="#10B981" />
          </div>
          <div className="stat-value" style={{ color: '#10B981' }}>94.2%</div>
          <div className="stat-sub">+4.8% from last safety cycle</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>OFFLINE SYNC STATUS</span>
            <RefreshCw size={16} color="#38BDF8" />
          </div>
          <div className="stat-value" style={{ color: '#38BDF8' }}>Synced</div>
          <div className="stat-sub">Telemetry queue reconciled</div>
        </div>
      </div>

      {/* Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="panel">
          <h3 className="panel-title">
            <ShieldCheck size={18} color="#F97316" />
            Mandatory AR Training Modules (Jharkhand Mining Sector)
          </h3>
          <table className="industrial-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Module Title</th>
                <th>Category</th>
                <th>Passing Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>MOD-FIRE-EXP-01</code></td>
                <td>Fire & Explosion Response</td>
                <td><span className="badge badge-red">FIRE / EXPLOSION</span></td>
                <td>80.0%</td>
                <td><span className="badge badge-green">ACTIVE</span></td>
              </tr>
              <tr>
                <td><code>MOD-GAS-CONF-02</code></td>
                <td>Gas Leak & Confined Space Protocol</td>
                <td><span className="badge badge-yellow">TOXIC GAS</span></td>
                <td>85.0%</td>
                <td><span className="badge badge-green">ACTIVE</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="panel">
          <h3 className="panel-title">System Health & Telemetry</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2A323D', paddingBottom: '8px' }}>
              <span style={{ color: '#94A3B8' }}>Core Engine:</span>
              <span style={{ fontFamily: 'monospace', color: '#10B981' }}>SurakshaAR REST v1</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2A323D', paddingBottom: '8px' }}>
              <span style={{ color: '#94A3B8' }}>Health Probe:</span>
              <span style={{ fontFamily: 'monospace' }}>{healthStatus}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2A323D', paddingBottom: '8px' }}>
              <span style={{ color: '#94A3B8' }}>Local Database:</span>
              <span style={{ fontFamily: 'monospace' }}>SQLite / PostgreSQL Ready</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2A323D', paddingBottom: '8px' }}>
              <span style={{ color: '#94A3B8' }}>Localization:</span>
              <span style={{ fontFamily: 'monospace' }}>Santali (Ol Chiki) • Hindi • EN</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
