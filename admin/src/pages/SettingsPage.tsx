import React from 'react';
import { Database, Wifi } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600 }}>System Settings & Offline Configuration</h3>
        <p style={{ fontSize: '13px', color: '#94A3B8' }}>
          Server infrastructure, database connection parameters, and AR device sync management.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="panel">
          <h4 className="panel-title">
            <Database size={18} color="#F97316" /> Database Architecture
          </h4>
          <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2A323D', paddingBottom: '8px' }}>
              <span style={{ color: '#94A3B8' }}>Primary ORM:</span>
              <span style={{ fontFamily: 'monospace' }}>Prisma ORM v5.22.0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2A323D', paddingBottom: '8px' }}>
              <span style={{ color: '#94A3B8' }}>Database Engine:</span>
              <span style={{ fontFamily: 'monospace' }}>PostgreSQL / SQLite Local</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2A323D', paddingBottom: '8px' }}>
              <span style={{ color: '#94A3B8' }}>Core Schema:</span>
              <span style={{ fontFamily: 'monospace', color: '#10B981' }}>15 Entities Active</span>
            </div>
          </div>
        </div>

        <div className="panel">
          <h4 className="panel-title">
            <Wifi size={18} color="#38BDF8" /> Offline-First Sync Settings
          </h4>
          <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2A323D', paddingBottom: '8px' }}>
              <span style={{ color: '#94A3B8' }}>Reconciliation Strategy:</span>
              <span style={{ fontFamily: 'monospace' }}>Client-Queue Idempotent</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2A323D', paddingBottom: '8px' }}>
              <span style={{ color: '#94A3B8' }}>Sync Retry Max:</span>
              <span style={{ fontFamily: 'monospace' }}>5 Attempts with Backoff</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2A323D', paddingBottom: '8px' }}>
              <span style={{ color: '#94A3B8' }}>AR Asset Cache:</span>
              <span style={{ fontFamily: 'monospace', color: '#10B981' }}>Enabled (Offline Assets)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
