import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';

export const HODAttendance: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShortage, setFilterShortage] = useState(false);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res = await api.get('/hod/attendance');
        setRecords(res.data.data.attendanceRecords);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch department attendance records.');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const filtered = records.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesShortage = filterShortage ? r.overallPercentage < 75 : true;
    return matchesSearch && matchesShortage;
  });

  if (loading && records.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-400">Loading department attendance registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Department Attendance
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Monitor attendance ratios and identify students with academic shortages.
        </p>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by student name or roll..."
          className="w-full sm:max-w-xs px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
        />

        <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 cursor-pointer">
          <input
            type="checkbox"
            checked={filterShortage}
            onChange={(e) => setFilterShortage(e.target.checked)}
            className="rounded border-slate-300 text-primary-500 focus:ring-primary-500"
          />
          Show Attendance Shortages Only (&lt; 75%)
        </label>
      </div>

      {/* Register List */}
      <div className="p-6 rounded-3xl glass-card space-y-4">
        <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Students Attendance Summary</h3>
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400 font-semibold py-8 text-center">No students match current search parameters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                  <th className="pb-3 pl-2">Roll Number</th>
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Section</th>
                  <th className="pb-3">Subject Breakdown</th>
                  <th className="pb-3 text-right pr-4">Overall Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filtered.map((record) => {
                  const hasShortage = record.overallPercentage < 75;
                  return (
                    <tr key={record.studentId} className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      <td className="py-4 pl-2 font-mono text-primary-500">{record.rollNumber}</td>
                      <td className="py-4">{record.name}</td>
                      <td className="py-4">Sem {record.semester} Sec {record.section}</td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-2">
                          {record.subjectWise.map((sub: any, idx: number) => (
                            <span
                              key={idx}
                              className={`px-2 py-1 rounded text-[9px] font-bold ${
                                sub.percentage >= 75
                                  ? 'bg-green-500/10 text-green-600'
                                  : 'bg-red-500/10 text-red-600'
                              }`}
                            >
                              {sub.subjectCode}: {sub.percentage}%
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 text-right pr-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                          hasShortage
                            ? 'bg-red-500/10 text-red-650'
                            : 'bg-green-500/10 text-green-650'
                        }`}>
                          {hasShortage ? <AlertTriangle className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                          {record.overallPercentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HODAttendance;
