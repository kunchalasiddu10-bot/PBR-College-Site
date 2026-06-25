import React, { useState, useEffect } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';

export const Attendance: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/attendance');
        setAttendances(res.data.data.attendances);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch attendance logs.');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendances();
  }, []);

  const filtered = attendances.filter((a) =>
    a.student?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.subject?.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && attendances.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-400">Loading attendance registers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Attendance Registers
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Review daily check-in histories and monitor attendance percentages.
        </p>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Search Filter */}
      <div className="max-w-md">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by subject code, name, or student roll number..."
          className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
        />
      </div>

      {/* List Table */}
      <div className="p-6 rounded-3xl glass-card space-y-4">
        <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Recorded Check-in Logs</h3>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardCheck className="h-10 w-10 mx-auto text-slate-400 mb-2" />
            <p className="text-xs font-semibold text-slate-400">No attendance logs match parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                  <th className="pb-3 pl-2">Date</th>
                  <th className="pb-3">Student Roll</th>
                  <th className="pb-3">Subject code</th>
                  <th className="pb-3 text-center">Semester</th>
                  <th className="pb-3 text-right pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filtered.map((a) => (
                  <tr key={a._id} className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    <td className="py-4 pl-2 font-mono">{new Date(a.date).toLocaleDateString()}</td>
                    <td className="py-4 text-primary-500 font-mono">{a.student?.rollNumber || 'N/A'}</td>
                    <td className="py-4">
                      <p>{a.subject?.name}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{a.subject?.code}</span>
                    </td>
                    <td className="py-4 text-center">{a.semester}</td>
                    <td className="py-4 text-right pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-extrabold ${
                        a.status === 'Present'
                          ? 'bg-green-500/10 text-green-600'
                          : a.status === 'Absent'
                          ? 'bg-red-500/10 text-red-600'
                          : 'bg-yellow-500/10 text-slate-900 dark:text-slate-200'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
