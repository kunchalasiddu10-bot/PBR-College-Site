import React, { useState, useEffect } from 'react';
import { Plus, Trash, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';

export const Timetables: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [timetables, setTimetables] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  // Form states
  const [day, setDay] = useState('Monday');
  const [subject, setSubject] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState(1);
  const [section, setSection] = useState('A');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:50');
  const [room, setRoom] = useState('LH-101');
  const [teacherName, setTeacherName] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [timeRes, subRes, deptRes] = await Promise.all([
        api.get('/admin/timetables'),
        api.get('/admin/subjects'),
        api.get('/admin/departments')
      ]);
      setTimetables(timeRes.data.data.timetables);
      setSubjects(subRes.data.data.subjects);
      setDepartments(deptRes.data.data.departments);
      if (subRes.data.data.subjects.length > 0) setSubject(subRes.data.data.subjects[0]._id);
      if (deptRes.data.data.departments.length > 0) setDepartment(deptRes.data.data.departments[0]._id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch timetable data.');
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

      await api.post('/admin/timetables', {
        day,
        subject,
        department,
        semester,
        section,
        startTime,
        endTime,
        room,
        teacherName
      });

      setMsg('Timetable entry created successfully!');
      setTeacherName('');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create timetable slot.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await api.delete(`/admin/timetables/${id}`);
      setMsg('Timetable entry deleted successfully.');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete timetable entry.');
      setLoading(false);
    }
  };

  if (loading && timetables.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-400">Loading academic timetables...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Timetables Management
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Maintain weekly class schedule templates and manage lecture room allocations.
        </p>
      </div>

      {msg && <Alert type="success" message={msg} />}
      {error && <Alert type="error" message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Form */}
        <form onSubmit={handleCreate} className="p-6 rounded-3xl glass-card space-y-4 h-fit">
          <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Allocate Class Slot</h3>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Week Day</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
            >
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
            >
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Semester</label>
              <input
                type="number"
                min={1}
                max={8}
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Section</label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Start Time</label>
              <input
                type="text"
                placeholder="e.g. 09:00"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-center"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">End Time</label>
              <input
                type="text"
                placeholder="e.g. 09:50"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-center"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Room Location</label>
            <input
              type="text"
              required
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Lecturer Full Name</label>
            <input
              type="text"
              required
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="e.g. Prof. Alex Mercer"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none"
            />
          </div>

          <Button type="submit" disabled={submitLoading} className="w-full flex justify-center items-center gap-2">
            {submitLoading ? <LoadingSpinner size="sm" /> : <><Plus className="h-4.5 w-4.5" /> Allocate Slot</>}
          </Button>
        </form>

        {/* Timetable List Grid */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-card space-y-4">
          <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Timetable Schedule Slots</h3>
          {timetables.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-10 w-10 mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-400">No timetable entries logged yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                    <th className="pb-3 pl-2">Day</th>
                    <th className="pb-3">Subject / Dept</th>
                    <th className="pb-3">Class target</th>
                    <th className="pb-3">Lecturer / Room</th>
                    <th className="pb-3 text-right pr-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {timetables.map((t) => (
                    <tr key={t._id} className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      <td className="py-4 pl-2 text-primary-500 font-extrabold">{t.day}</td>
                      <td className="py-4">
                        <p>{t.subject?.name}</p>
                        <span className="text-[10px] text-slate-400 font-mono">{t.subject?.code} • {t.department?.code}</span>
                      </td>
                      <td className="py-4">Sem {t.semester} • Sec {t.section}</td>
                      <td className="py-4">
                        <p>{t.teacherName}</p>
                        <span className="text-[10px] text-slate-400 font-mono">Room: {t.room} • {t.startTime}-{t.endTime}</span>
                      </td>
                      <td className="py-4 text-right pr-4">
                        <button
                          onClick={() => handleDelete(t._id)}
                          className="text-red-500 hover:text-red-750 inline-flex items-center"
                        >
                          <Trash className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timetables;
