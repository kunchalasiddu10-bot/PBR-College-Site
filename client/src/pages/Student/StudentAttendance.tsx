import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';

export const StudentAttendance: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const response = await api.get('/student/attendance');
        setAttendance(response.data.data.attendanceSummary);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch attendance records.');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-400">Loading attendance reports...</p>
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} className="max-w-2xl mx-auto" />;
  }

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Attendance Roster
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Monitor your class check-ins. Keep percentage ratios above 75% to stay academic compliant.
        </p>
      </div>

      {/* Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {attendance.map((sub) => {
          const isSafe = sub.percentage >= 75;
          const progressColor = isSafe ? 'bg-green-500' : 'bg-red-500';

          return (
            <div key={sub.subjectId} className="p-6 rounded-3xl glass-card space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    {sub.subjectCode} • {sub.credits} Credits
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-800 dark:text-white leading-snug">
                    {sub.subjectName}
                  </h3>
                </div>
                
                <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 ${
                  isSafe
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400'
                }`}>
                  {isSafe ? <ShieldCheck className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                  {sub.percentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-850 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                  style={{ width: `${sub.percentage}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                <span>Classes Marked: {sub.totalClasses}</span>
                <span>Present: {sub.presentClasses} | Absent: {sub.totalClasses - sub.presentClasses}</span>
              </div>

              {!isSafe && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-[11px] text-red-800 dark:text-red-300 font-semibold border border-red-200/50 dark:border-red-900/50">
                  ⚠️ Attendance shortage! You must attend the next few lectures to restore your safe percentage.
                </div>
              )}
            </div>
          );
        })}
      </div>
      
    </div>
  );
};

export default StudentAttendance;
