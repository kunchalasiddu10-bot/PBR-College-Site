import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';

export const AuditLogs: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/audit-logs');
      setLogs(res.data.data.auditLogs);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch audit log trail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 font-bold text-xs">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">ERP Audit Trail</h1>
        <p className="text-xs font-semibold text-slate-500 mt-1">Audit security operations, password changes, student modifications, and administrative tasks.</p>
      </div>

      {loading ? (
        <div className="h-[40vh] flex justify-center items-center"><LoadingSpinner /></div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : logs.length === 0 ? (
        <div className="text-center py-12 border rounded-3xl glass-card">
          <p className="text-slate-400 font-bold text-sm">No log files recorded.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg">
          <table className="w-full text-left text-xs bg-white dark:bg-slate-900">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-400 uppercase tracking-widest text-[9px] font-bold">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Action Type</th>
                <th className="px-6 py-4">Operator</th>
                <th className="px-6 py-4">Activity Description</th>
                <th className="px-6 py-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-850">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 font-bold">
                  <td className="px-6 py-4 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 text-primary-500">{log.action}</td>
                  <td className="px-6 py-4 text-slate-800 dark:text-slate-200">{log.user?.name || 'Anonymous Operator'}</td>
                  <td className="px-6 py-4 text-slate-500 font-normal">{log.details}</td>
                  <td className="px-6 py-4 font-mono text-[10px] text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
