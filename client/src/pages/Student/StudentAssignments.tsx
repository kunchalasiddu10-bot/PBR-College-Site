import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, AlertCircle, FileText, Send, Check, Clock } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';

export const StudentAssignments: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [submitUrls, setSubmitUrls] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState<{ [key: string]: string }>({});
  const [submitSuccess, setSubmitSuccess] = useState<{ [key: string]: string }>({});

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/student/assignments');
      setAssignments(response.data.data.assignments);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleUrlChange = (asnId: string, val: string) => {
    setSubmitUrls((prev) => ({ ...prev, [asnId]: val }));
    setSubmitError((prev) => ({ ...prev, [asnId]: '' }));
  };

  const handleFormSubmit = async (e: React.FormEvent, asnId: string) => {
    e.preventDefault();
    const url = submitUrls[asnId];

    if (!url || !url.startsWith('http')) {
      setSubmitError((prev) => ({ ...prev, [asnId]: 'Please provide a valid URL link starting with http:// or https://' }));
      return;
    }

    try {
      setSubmittingId(asnId);
      setSubmitError((prev) => ({ ...prev, [asnId]: '' }));
      setSubmitSuccess((prev) => ({ ...prev, [asnId]: '' }));

      await api.post(`/student/assignments/${asnId}/submit`, {
        attachmentUrl: url,
      });

      setSubmitSuccess((prev) => ({ ...prev, [asnId]: 'Assignment uploaded successfully!' }));
      
      // Update list state locally
      setAssignments((prev) =>
        prev.map((asn) =>
          asn.id === asnId
            ? {
                ...asn,
                submission: {
                  submittedAt: new Date(),
                  attachmentUrl: url,
                  status: 'Submitted',
                  grade: '',
                  remarks: '',
                },
              }
            : asn
        )
      );

      // Clear input fields
      setSubmitUrls((prev) => ({ ...prev, [asnId]: '' }));
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit assignment.';
      setSubmitError((prev) => ({ ...prev, [asnId]: msg }));
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-400">Loading course assignments...</p>
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
          Course Assignments
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          View assigned tasks, review grading reports, and submit Google Drive or repository links.
        </p>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {assignments.map((asn) => {
          const hasSubmission = !!asn.submission;
          const isGraded = asn.submission?.status === 'Graded';
          const isOverdue = new Date(asn.dueDate) < new Date() && !hasSubmission;

          return (
            <div
              key={asn.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col gap-5 ${
                isGraded
                  ? 'bg-green-50/10 border-green-200/50 dark:border-green-900/20'
                  : hasSubmission
                  ? 'bg-primary-50/10 border-primary-200/50 dark:border-primary-900/20'
                  : isOverdue
                  ? 'bg-red-50/10 border-red-200/50 dark:border-red-900/20'
                  : 'glass-card border-transparent'
              }`}
            >
              {/* Top Banner */}
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    {asn.subject?.name} ({asn.subject?.code})
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                    {asn.title}
                  </h3>
                </div>

                {/* Status Badges */}
                <div className="shrink-0">
                  {isGraded ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-600 dark:text-green-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Graded: {asn.submission.grade}
                    </span>
                  ) : hasSubmission ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary-500/10 text-primary-500 flex items-center gap-1.5 uppercase tracking-wider">
                      <Check className="h-3.5 w-3.5" /> Submitted
                    </span>
                  ) : isOverdue ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 flex items-center gap-1.5 uppercase tracking-wider animate-pulse">
                      <AlertCircle className="h-3.5 w-3.5" /> Overdue
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <Clock className="h-3.5 w-3.5" /> Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                {asn.description}
              </p>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4 py-2 border-t border-b border-slate-200/50 dark:border-slate-800/50 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  Due: {new Date(asn.dueDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  Max Marks: {asn.maxMarks}
                </span>
              </div>

              {/* Submissions Section */}
              <div className="mt-auto">
                {hasSubmission ? (
                  <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      YOUR SUBMISSION LINK:
                    </p>
                    <a
                      href={asn.submission.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-500 font-semibold underline truncate block"
                    >
                      {asn.submission.attachmentUrl}
                    </a>
                    
                    {asn.submission.remarks && (
                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-medium leading-relaxed mt-2 text-slate-600 dark:text-slate-300">
                        <span className="font-bold text-[10px] text-slate-400 block mb-1">FACULTY REMARKS:</span>
                        "{asn.submission.remarks}"
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={(e) => handleFormSubmit(e, asn.id)} className="space-y-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Submit Deliverable Link
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://drive.google.com/..."
                          value={submitUrls[asn.id] || ''}
                          onChange={(e) => handleUrlChange(asn.id, e.target.value)}
                          disabled={submittingId === asn.id}
                          className="flex-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border focus:outline-none focus:border-primary-500 text-xs font-semibold"
                        />
                        <Button
                          type="submit"
                          isLoading={submittingId === asn.id}
                          className="px-4 py-2 h-9 w-24 shrink-0 rounded-xl"
                        >
                          <Send className="h-3.5 w-3.5" /> Submit
                        </Button>
                      </div>
                    </div>
                    {submitError[asn.id] && (
                      <p className="text-[10px] text-red-500 font-bold animate-fade-in">
                        {submitError[asn.id]}
                      </p>
                    )}
                    {submitSuccess[asn.id] && (
                      <p className="text-[10px] text-green-500 font-bold animate-fade-in">
                        {submitSuccess[asn.id]}
                      </p>
                    )}
                  </form>
                )}
              </div>

            </div>
          );
        })}
      </div>
      
    </div>
  );
};

export default StudentAssignments;
