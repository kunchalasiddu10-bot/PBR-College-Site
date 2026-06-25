import React, { useState, useEffect } from 'react';
import { BookOpen, BookMarked, AlertCircle, CheckCircle, CalendarDays } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';

export const StudentLibrary: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loans, setLoans] = useState<any[]>([]);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true);
        const response = await api.get('/student/library');
        setLoans(response.data.data.loans);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch library checkouts.');
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-400">Loading library account...</p>
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} className="max-w-2xl mx-auto" />;
  }

  // Calculate stats
  const activeIssues = loans.filter((l) => l.status !== 'Returned');
  const fineTotal = activeIssues.reduce((acc, curr) => acc + (curr.fineAmount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Library Workspace
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Monitor your active book issues, track due dates, and view outstanding fine metrics.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Issues</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {activeIssues.length} Books
            </p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Currently checked out</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
            <BookMarked className="h-6 w-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Outstanding Fines</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              ${fineTotal.toFixed(2)}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Accumulated library charges</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <AlertCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Book Loans List */}
      <div className="space-y-6">
        <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Borrowing Activity</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loans.length === 0 ? (
            <div className="col-span-full p-12 text-center rounded-3xl glass-card space-y-4">
              <div className="mx-auto h-12 w-12 bg-slate-100 dark:bg-slate-850 rounded-2xl flex items-center justify-center text-slate-400">
                <BookOpen className="h-6 w-6" />
              </div>
              <p className="text-sm font-extrabold text-slate-800 dark:text-white">No Borrowing History</p>
              <p className="text-xs text-slate-400">You haven't checked out any books yet.</p>
            </div>
          ) : (
            loans.map((loan) => {
              const isReturned = loan.status === 'Returned';
              const isOverdue = loan.status === 'Overdue' || (new Date(loan.dueDate) < new Date() && !isReturned);
              const dueDate = new Date(loan.dueDate);

              return (
                <div
                  key={loan._id}
                  className={`p-6 rounded-3xl border flex flex-col gap-4 relative overflow-hidden ${
                    isReturned
                      ? 'bg-slate-100/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/40 opacity-70'
                      : isOverdue
                      ? 'bg-red-50/15 border-red-500/30'
                      : 'glass-card border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                        ISBN: {loan.book?.isbn}
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                        {loan.book?.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-semibold">by {loan.book?.author}</p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                      isReturned
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                        : isOverdue
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400 animate-pulse'
                        : 'bg-primary-500/10 text-primary-500'
                    }`}>
                      {loan.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-2 border-t border-slate-200/30 dark:border-slate-800/30 text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-slate-400 shrink-0" />
                      Issued: {new Date(loan.issueDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-slate-400 shrink-0" />
                      Due: {dueDate.toLocaleDateString()}
                    </span>
                  </div>

                  {loan.fineAmount > 0 && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-[10px] font-bold text-red-600 dark:text-red-400 flex justify-between items-center">
                      <span>⚠️ Overdue fine accumulated:</span>
                      <span>${loan.fineAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {isReturned && loan.returnDate && (
                    <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 shrink-0" />
                      Returned on {new Date(loan.returnDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};

export default StudentLibrary;
