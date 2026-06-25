import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';

export const Assignments: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/assignments');
        setAssignments(res.data.data.assignments);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch assignments logs.');
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const filtered = assignments.filter((a) =>
    a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.subject?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && assignments.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-400">Loading assignments logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Assignments Log
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Review details of student coursework, lab briefs, and due dates.
        </p>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Filter search */}
      <div className="max-w-md">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by assignment title, subject name, or code..."
          className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
        />
      </div>

      {/* Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl glass-card space-y-2">
            <FileText className="h-10 w-10 mx-auto text-slate-400" />
            <p className="text-xs font-semibold text-slate-400">No coursework assignments found.</p>
          </div>
        ) : (
          filtered.map((a) => (
            <div key={a._id} className="p-6 rounded-3xl glass-card space-y-4 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                  {a.subject?.code} • Max: {a.maxMarks} Marks
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-primary-500/10 text-primary-500 uppercase tracking-wider">
                  Semester {a.semester} • Section {a.section}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white leading-snug truncate">
                  {a.title}
                </h3>
                <p className="text-xs text-slate-450 font-semibold line-clamp-2">
                  {a.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-bold text-slate-400">
                <span>Subject: {a.subject?.name}</span>
                <span>Due Date: {new Date(a.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Assignments;
