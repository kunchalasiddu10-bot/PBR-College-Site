import React, { useState, useEffect } from 'react';
import { CalendarClock, MapPin, AlertCircle, Clock } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';

export const StudentExams: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const response = await api.get('/student/exams');
        setExams(response.data.data.exams);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch exam schedules.');
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-400">Loading exam schedules...</p>
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
          Exam Schedule
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Stay updated on your upcoming assessments, midterms, and final semester exams.
        </p>
      </div>

      {/* Roster Cards list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl glass-card space-y-4">
            <div className="mx-auto h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
              <CalendarClock className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-extrabold text-slate-800 dark:text-white">No Upcoming Exams</p>
              <p className="text-xs text-slate-400">There are no exams currently registered for your course subjects.</p>
            </div>
          </div>
        ) : (
          exams.map((ex) => {
            const examDate = new Date(ex.date);
            const isToday = examDate.toDateString() === new Date().toDateString();

            return (
              <div
                key={ex._id}
                className={`p-6 rounded-3xl border transition-all flex flex-col gap-4 relative overflow-hidden ${
                  isToday
                    ? 'bg-red-50/15 border-red-500/30'
                    : 'glass-card border-transparent'
                }`}
              >
                {/* Visual badge top */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      {ex.subject?.code}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                      {ex.subject?.name}
                    </h3>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                    ex.type === 'Semester End'
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                      : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {ex.type}
                  </span>
                </div>

                {/* Exam Date timeslots */}
                <div className="space-y-2 py-2 border-t border-b border-slate-200/40 dark:border-slate-800/40">
                  <div className="flex items-center gap-2.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <CalendarClock className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{examDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <Clock className="h-4 w-4 text-slate-400 shrink-0" style={{ animation: isToday ? 'spin 5s linear infinite' : '' }} />
                    <span>{ex.time}</span>
                  </div>
                </div>

                {/* Hall Location */}
                <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-slate-400 shrink-0" /> Hall: {ex.room}</span>
                </div>

                {isToday && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-[10px] font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    THIS EXAM IS SCHEDULED FOR TODAY!
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
    </div>
  );
};

export default StudentExams;
