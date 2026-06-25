import React, { useState, useEffect } from 'react';
import { Users, Mail, BookOpen, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';

export const HODFaculty: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workload, setWorkload] = useState<any[]>([]);

  useEffect(() => {
    const fetchWorkload = async () => {
      try {
        setLoading(true);
        const res = await api.get('/hod/workload');
        setWorkload(res.data.data.workload);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch faculty workload.');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkload();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-400">Loading department faculty directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Faculty Workload
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Review department lecturers, assigned subjects, and workload credit calculations.
        </p>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Grid of faculty workload cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workload.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl glass-card space-y-2">
            <Users className="h-10 w-10 mx-auto text-slate-400" />
            <p className="text-xs font-semibold text-slate-400">No faculty members found in department.</p>
          </div>
        ) : (
          workload.map((w) => (
            <div key={w.faculty?.id} className="p-6 rounded-3xl glass-card space-y-4 hover:shadow-md transition">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary-500/10 border border-primary-500/20 overflow-hidden flex items-center justify-center text-lg font-extrabold text-primary-500 uppercase">
                  {w.faculty?.profileImage ? (
                    <img src={w.faculty.profileImage} alt={w.faculty.name} className="h-full w-full object-cover" />
                  ) : (
                    w.faculty?.name[0]
                  )}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-base font-extrabold text-slate-800 dark:text-white truncate">{w.faculty?.name}</h4>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400 font-bold truncate">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" /> {w.faculty?.email}
                  </span>
                </div>
              </div>

              {/* Workload credits card details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/40 dark:border-slate-800/40">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Allocated Classes</p>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">{w.allocationsCount}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/40 dark:border-slate-800/40">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Credits</p>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">{w.totalCredits} Credits</p>
                </div>
              </div>

              {/* Assigned classes list details */}
              <div className="space-y-2">
                <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5 text-slate-400" /> Allocated Subjects List
                </h5>
                <div className="flex flex-col gap-1.5 pt-1">
                  {w.allocations.length === 0 ? (
                    <span className="text-[11px] font-bold text-red-500 flex items-center gap-1">
                      <ShieldAlert className="h-3.5 w-3.5" /> No classes assigned. Shortage!
                    </span>
                  ) : (
                    w.allocations.map((alloc: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/30 dark:border-slate-850 text-[11px] font-bold flex justify-between">
                        <span>{alloc.subject?.name}</span>
                        <span className="text-primary-500 uppercase">Sec {alloc.section?.name}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HODFaculty;
