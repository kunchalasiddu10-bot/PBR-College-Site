import React, { useState, useEffect } from 'react';
import { AlertOctagon, CheckCircle, Save } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';

export const HODComplaints: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [complaints, setComplaints] = useState<any[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [status, setStatus] = useState('In-Progress');
  const [remarks, setRemarks] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hod/complaints');
      setComplaints(res.data.data.complaints);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch complaints roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      setSubmitLoading(true);
      setError(null);
      setMsg(null);

      await api.patch(`/hod/complaints/${selectedComplaint._id}`, {
        status,
        remarks
      });

      setMsg('Complaint status updated successfully!');
      setSelectedComplaint(null);
      setRemarks('');
      fetchComplaints();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update complaint.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading && complaints.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-400">Loading complaints ticket logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Complaints Desk
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Review filed grievances, write feedback remarks, and resolve student tickets.
        </p>
      </div>

      {msg && <Alert type="success" message={msg} />}
      {error && <Alert type="error" message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Complaints List */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-card space-y-4">
          <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Department Complaints Register</h3>
          {complaints.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-10 w-10 mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-400">All complaints are resolved. Clean slate!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map((c) => (
                <div
                  key={c._id}
                  onClick={() => {
                    setSelectedComplaint(c);
                    setStatus(c.status);
                    setRemarks(c.remarks || '');
                  }}
                  className={`p-4 rounded-2xl border transition cursor-pointer text-xs font-bold ${
                    selectedComplaint?._id === c._id
                      ? 'border-primary-500 bg-primary-500/5'
                      : 'bg-slate-100/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-850'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                      {c.category} • Roll: {c.student?.rollNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-extrabold ${
                      c.status === 'Resolved'
                        ? 'bg-green-500/10 text-green-600'
                        : c.status === 'In-Progress'
                        ? 'bg-yellow-500/10 text-yellow-600'
                        : 'bg-red-500/10 text-red-650'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-850 dark:text-white mt-2 leading-tight">{c.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1 leading-snug">{c.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Update Form */}
        <div>
          {selectedComplaint ? (
            <form onSubmit={handleUpdate} className="p-6 rounded-3xl glass-card space-y-4">
              <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Update Complaint Status</h3>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Grievance Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
                >
                  {['Open', 'In-Progress', 'Resolved'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Resolution Remarks / Action taken</label>
                <textarea
                  required
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter actions taken..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
                />
              </div>

              <Button type="submit" disabled={submitLoading} className="w-full flex justify-center items-center gap-2">
                {submitLoading ? <LoadingSpinner size="sm" /> : <><Save className="h-4.5 w-4.5" /> Save Remarks</>}
              </Button>
            </form>
          ) : (
            <div className="p-6 rounded-3xl glass-card text-center space-y-2">
              <AlertOctagon className="h-10 w-10 mx-auto text-slate-400" />
              <p className="text-xs text-slate-400 font-semibold">Select a complaint ticket from register feed list to resolve.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default HODComplaints;
