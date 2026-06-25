import React, { useState, useEffect } from 'react';
import { CalendarClock, Plus } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';

export const Exams: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  // Create Form State
  const [selectedSubject, setSelectedSubject] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM - 01:00 PM');
  const [room, setRoom] = useState('LH-101');
  const [type, setType] = useState('Semester End');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [examRes, subRes] = await Promise.all([
        api.get('/admin/exams'),
        api.get('/admin/subjects')
      ]);
      setExams(examRes.data.data.exams);
      setSubjects(subRes.data.data.subjects);
      if (subRes.data.data.subjects.length > 0) {
        setSelectedSubject(subRes.data.data.subjects[0]._id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch exam schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      setError(null);
      setMsg(null);

      await api.post('/admin/exams', {
        subject: selectedSubject,
        date,
        time,
        room,
        type
      });

      setMsg('Exam schedule entry logged successfully!');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create exam entry.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading && exams.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-400">Loading exam schedules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Exams Management
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Maintain midterm dates, seating blocks, and term final exam schedules.
        </p>
      </div>

      {msg && <Alert type="success" message={msg} />}
      {error && <Alert type="error" message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <form onSubmit={handleCreate} className="p-6 rounded-3xl glass-card space-y-4 h-fit">
          <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Schedule New Exam</h3>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
            >
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Exam Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Time Slot</label>
            <input
              type="text"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="e.g. 10:00 AM - 01:00 PM"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Seating Block / Room</label>
            <input
              type="text"
              required
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Exam Category</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
            >
              {['Mid-Term 1', 'Mid-Term 2', 'Lab Internal', 'Lab External', 'Semester End'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <Button type="submit" disabled={submitLoading} className="w-full flex justify-center items-center gap-2">
            {submitLoading ? <LoadingSpinner size="sm" /> : <><Plus className="h-4.5 w-4.5" /> Log Exam Date</>}
          </Button>
        </form>

        {/* Exams Roster Cards */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-card space-y-4">
          <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Exam Schedule List</h3>
          {exams.length === 0 ? (
            <div className="text-center py-12">
              <CalendarClock className="h-10 w-10 mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-400">No scheduled exams logged yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {exams.map((exam) => (
                <div key={exam._id} className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-800/30 border space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {exam.type}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-850 dark:text-white mt-2 leading-tight">{exam.subject?.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{exam.subject?.code}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/40 dark:border-slate-800/40 text-xs font-bold text-slate-500 space-y-1">
                    <p><span className="text-primary-500">Date:</span> {new Date(exam.date).toLocaleDateString()}</p>
                    <p><span className="text-primary-500">Time:</span> {exam.time}</p>
                    <p><span className="text-primary-500">Room:</span> {exam.room}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Exams;
