import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, PlusCircle, CheckCircle, Clock, Eye, Save, Download } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';

export const FacultyAssignments: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [assignments, setAssignments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'grade'>('list');

  // Create Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxMarks, setMaxMarks] = useState(50);
  const [attachmentUrl, setAttachmentUrl] = useState('');

  // Grading Queue State
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [activeSubmission, setActiveSubmission] = useState<any>(null);
  const [grade, setGrade] = useState('A');
  const [remarks, setRemarks] = useState('');

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const [asnRes, classRes] = await Promise.all([
        api.get('/faculty/assignments'),
        api.get('/faculty/assigned-classes')
      ]);
      setAssignments(asnRes.data.data.assignments);
      setClasses(classRes.data.data.assignments);
      if (classRes.data.data.assignments.length > 0) {
        setSelectedClass(classRes.data.data.assignments[0]._id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch assignments logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeClass = classes.find((c) => c._id === selectedClass);
    if (!activeClass) return;

    try {
      setSubmitLoading(true);
      setError(null);
      setMsg(null);

      await api.post('/faculty/assignments', {
        title,
        description,
        subject: activeClass.subject?._id,
        section: activeClass.section?.name,
        semester: activeClass.section?.semester || 3,
        dueDate,
        maxMarks,
        attachmentUrl
      });

      setMsg('Assignment posted successfully and notifications pushed!');
      setTitle('');
      setDescription('');
      setAttachmentUrl('');
      setActiveTab('list');
      fetchAssignments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create assignment.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleOpenGradeQueue = async (asn: any) => {
    try {
      setLoading(true);
      setSelectedAssignment(asn);
      const res = await api.get(`/faculty/submissions/${asn._id}`);
      setSubmissions(res.data.data.submissions);
      setActiveTab('grade');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load submissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmission) return;

    try {
      setSubmitLoading(true);
      setError(null);

      await api.patch(`/faculty/submissions/${activeSubmission._id}/grade`, {
        grade,
        remarks
      });

      setMsg('Grade assigned and student profile notified!');
      setActiveSubmission(null);
      setGrade('A');
      setRemarks('');
      
      // Reload submissions queue
      const res = await api.get(`/faculty/submissions/${selectedAssignment._id}`);
      setSubmissions(res.data.data.submissions);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign grade.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading && assignments.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-400">Loading assignments workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Assignments Log
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Create problem statements, view submissions, and record marks.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'list'
                ? 'bg-primary-500 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-slate-500'
            }`}
          >
            Assignments List
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-primary-500 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-slate-500'
            }`}
          >
            <PlusCircle className="h-4 w-4" /> Post Assignment
          </button>
        </div>
      </div>

      {msg && <Alert type="success" message={msg} />}
      {error && <Alert type="error" message={error} />}

      {/* 1. Assignments List View */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.length === 0 ? (
            <div className="col-span-full p-12 text-center rounded-3xl glass-card space-y-2">
              <FileSpreadsheet className="h-10 w-10 mx-auto text-slate-400" />
              <p className="text-xs font-semibold text-slate-400">No active assignments posted.</p>
            </div>
          ) : (
            assignments.map((asn) => (
              <div key={asn._id} className="p-6 rounded-3xl glass-card space-y-4 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    {asn.subject?.code} • Max: {asn.maxMarks} M
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary-500/10 text-primary-500 uppercase tracking-wider">
                    Sem {asn.semester} Sec {asn.section}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white leading-snug truncate">
                    {asn.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold line-clamp-2">
                    {asn.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-400" />
                    Due: {new Date(asn.dueDate).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleOpenGradeQueue(asn)}
                    className="flex items-center gap-1 text-primary-500 font-extrabold hover:text-primary-650"
                  >
                    Grade Queue <Eye className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. Create Assignment Form */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateAssignment} className="p-6 rounded-3xl glass-card space-y-6 max-w-2xl">
          <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Assignment Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Class Taught</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
              >
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.subject?.name} - Section {c.section?.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Assignment Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Design OS Process Scheduler"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Description / Brief Instructions</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description, objectives, and submission parameters..."
                rows={4}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Submission Due Date</label>
              <input
                type="datetime-local"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Maximum Marks</label>
              <input
                type="number"
                required
                value={maxMarks}
                onChange={(e) => setMaxMarks(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Reference Document Link (Optional)</label>
              <input
                type="url"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                placeholder="e.g. S3 PDF guidelines URL"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={submitLoading} className="flex items-center gap-2">
              {submitLoading ? <LoadingSpinner size="sm" /> : 'Post Assignment Task'}
            </Button>
          </div>
        </form>
      )}

      {/* 3. Grading Queue View */}
      {activeTab === 'grade' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Submissions List */}
          <div className="lg:col-span-2 p-6 rounded-3xl glass-card space-y-4">
            <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">
              Submissions for: <span className="text-primary-500">{selectedAssignment?.title}</span>
            </h3>
            {submissions.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold py-8 text-center">No student submissions uploaded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                      <th className="pb-3 pl-2">Student</th>
                      <th className="pb-3">Submitted At</th>
                      <th className="pb-3 text-center">Attachment</th>
                      <th className="pb-3 text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {submissions.map((sub) => (
                      <tr key={sub._id} className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        <td className="py-4 pl-2">
                          <p className="font-extrabold">{sub.student?.user?.name}</p>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest">{sub.student?.rollNumber}</span>
                        </td>
                        <td className="py-4">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                        <td className="py-4 text-center">
                          {sub.attachmentUrl && (
                            <a
                              href={sub.attachmentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-primary-500 hover:text-primary-650"
                            >
                              <Download className="h-4 w-4" /> Doc
                            </a>
                          )}
                        </td>
                        <td className="py-4 text-right pr-4">
                          <button
                            onClick={() => {
                              setActiveSubmission(sub);
                              setGrade(sub.grade || 'A');
                              setRemarks(sub.remarks || '');
                            }}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider ${
                              sub.status === 'Graded'
                                ? 'bg-green-500/10 text-green-600'
                                : 'bg-yellow-500/10 text-yellow-600'
                            }`}
                          >
                            {sub.status === 'Graded' ? `Grade: ${sub.grade}` : 'Score File'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Scoring panel */}
          <div>
            {activeSubmission ? (
              <form onSubmit={handleGradeSubmission} className="p-6 rounded-3xl glass-card space-y-4">
                <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Assign Grade</h3>
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border text-xs font-semibold space-y-2">
                  <p className="text-slate-400">SCORING DETAILS:</p>
                  <p><span className="font-bold text-primary-500">Student:</span> {activeSubmission.student?.user?.name}</p>
                  <p><span className="font-bold text-primary-500">Roll:</span> {activeSubmission.student?.rollNumber}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Final Grade Designation</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
                  >
                    {['O', 'A', 'B', 'C', 'D', 'F'].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Feedback Remarks</label>
                  <textarea
                    required
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter review remarks..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
                  />
                </div>

                <Button type="submit" disabled={submitLoading} className="w-full flex justify-center items-center gap-2">
                  {submitLoading ? <LoadingSpinner size="sm" /> : <><Save className="h-4.5 w-4.5" /> Save Evaluation</>}
                </Button>
              </form>
            ) : (
              <div className="p-6 rounded-3xl glass-card text-center space-y-2">
                <CheckCircle className="h-10 w-10 mx-auto text-slate-400" />
                <p className="text-xs text-slate-400 font-semibold">Select a submission from the list queue to assign feedback scores.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyAssignments;
