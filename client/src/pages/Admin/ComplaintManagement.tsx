import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import { CheckCircle, Clock } from 'lucide-react';

export const ComplaintManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<any[]>([]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/complaints');
      setComplaints(res.data.data.complaints);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch complaint registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const updateStatus = async (id: string, status: 'In-Progress' | 'Resolved') => {
    const remarks = prompt('Enter resolution remarks:');
    try {
      await api.patch(`/admin/complaints/${id}/status`, { status, remarks });
      fetchComplaints();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update complaint status.');
    }
  };

  return (
    <div className="space-y-6 font-bold text-xs">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Complaints Resolver</h1>
        <p className="text-xs font-semibold text-slate-500 mt-1">Review student infrastructure, hostel, and academic complaint tickets.</p>
      </div>

      {loading ? (
        <div className="h-[40vh] flex justify-center items-center"><LoadingSpinner /></div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : complaints.length === 0 ? (
        <div className="text-center py-12 border rounded-3xl glass-card">
          <p className="text-slate-400 font-bold text-sm">No complaints logged in system.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {complaints.map((c) => (
            <div key={c._id} className="p-6 rounded-3xl glass-card space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${
                    c.status === 'Resolved' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {c.status}
                  </span>
                  <span className="text-[10px] text-slate-400">Filed by: {c.student?.user?.name || 'Unknown Student'}</span>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold">{c.title}</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Category: {c.category}</p>
                  <p className="text-[10px] text-slate-500 mt-2 font-normal font-sans leading-relaxed">{c.description}</p>
                </div>

                {c.remarks && (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800/50 text-[10px] font-normal leading-relaxed">
                    <p className="font-bold text-slate-400 uppercase text-[9px]">Resolution Remarks:</p>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">{c.remarks}</p>
                  </div>
                )}
              </div>

              {c.status !== 'Resolved' && (
                <div className="flex gap-2 justify-end border-t pt-3 mt-4">
                  <button onClick={() => updateStatus(c._id, 'In-Progress')} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-350 dark:hover:bg-slate-700 rounded-xl flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Set In-Progress
                  </button>
                  <button onClick={() => updateStatus(c._id, 'Resolved')} className="px-3 py-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/25 rounded-xl flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" /> Resolve Ticket
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ComplaintManagement;
