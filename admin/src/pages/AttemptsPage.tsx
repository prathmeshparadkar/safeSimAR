import React from 'react';

const demoAttempts = [
  {
    id: 'att-001',
    worker: 'Birsa Soren',
    empId: 'CCL-EMP-8921',
    scenario: 'Methane Flare Suppression (Underground Face)',
    score: '92.5%',
    duration: '3m 42s',
    offline: 'No (Live)',
    status: 'PASSED',
    date: '2026-10-02 09:18',
  },
  {
    id: 'att-002',
    worker: 'Soma Marandi',
    empId: 'CCL-EMP-3310',
    scenario: 'Toxic CO & Methane Gas Pocket Breach',
    score: '88.0%',
    duration: '3m 05s',
    offline: 'Yes (Synced)',
    status: 'PASSED',
    date: '2026-10-02 14:23',
  },
  {
    id: 'att-003',
    worker: 'Ramesh Mahato',
    empId: 'CCL-EMP-4420',
    scenario: 'Methane Flare Suppression (Underground Face)',
    score: '96.0%',
    duration: '2m 50s',
    offline: 'No (Live)',
    status: 'PASSED',
    date: '2026-10-03 08:45',
  },
];

export const AttemptsPage: React.FC = () => {
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600 }}>AR Training Attempts & Telemetry Log</h3>
        <p style={{ fontSize: '13px', color: '#94A3B8' }}>
          Detailed record of worker interactions, response times, and pass/fail assessments.
        </p>
      </div>

      <div className="panel">
        <table className="industrial-table">
          <thead>
            <tr>
              <th>Attempt ID</th>
              <th>Worker Name</th>
              <th>Employee ID</th>
              <th>Scenario</th>
              <th>Score</th>
              <th>Duration</th>
              <th>Offline Mode</th>
              <th>Result</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {demoAttempts.map((a) => (
              <tr key={a.id}>
                <td><code>{a.id}</code></td>
                <td style={{ fontWeight: 600 }}>{a.worker}</td>
                <td><code>{a.empId}</code></td>
                <td>{a.scenario}</td>
                <td style={{ fontWeight: 600, color: '#10B981' }}>{a.score}</td>
                <td>{a.duration}</td>
                <td><span className="badge badge-yellow">{a.offline}</span></td>
                <td><span className="badge badge-green">{a.status}</span></td>
                <td style={{ color: '#94A3B8' }}>{a.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
