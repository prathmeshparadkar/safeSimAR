import React from 'react';
import { ShieldCheck, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

export const CompliancePage: React.FC = () => {
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Mines Act 1952 & DGMS Compliance Audit</h3>
        <p style={{ fontSize: '13px', color: '#94A3B8' }}>
          Statutory compliance tracking for vocational training of underground and opencast workforce.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">
            <span>REGULATORY READINESS</span>
            <ShieldCheck size={16} color="#10B981" />
          </div>
          <div className="stat-value" style={{ color: '#10B981' }}>98.4%</div>
          <div className="stat-sub">Audit criteria satisfied</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>DANGEROUS OCCURRENCE DRILLS</span>
            <AlertCircle size={16} color="#EAB308" />
          </div>
          <div className="stat-value">100%</div>
          <div className="stat-sub">Methane & gas leak simulations logged</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>SANTHALI LOCALIZATION RATE</span>
            <FileText size={16} color="#38BDF8" />
          </div>
          <div className="stat-value" style={{ color: '#38BDF8' }}>100%</div>
          <div className="stat-sub">Trilingual audio & HUD scripts available</div>
        </div>
      </div>

      <div className="panel">
        <h4 className="panel-title">Statutory Training Checklist</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 color="#10B981" size={18} />
            <span>Mines Vocational Training Rules (MVTR) 1966 - Refresher Practical Training Module</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 color="#10B981" size={18} />
            <span>DGMS Circular No. 04 of 2021 - Mandatory Virtual / AR Simulation for In-Mine Gas Emergencies</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 color="#10B981" size={18} />
            <span>Jharkhand State Industrial Policy 2021 - Vernacular Worker Safety Upskilling</span>
          </div>
        </div>
      </div>
    </div>
  );
};
