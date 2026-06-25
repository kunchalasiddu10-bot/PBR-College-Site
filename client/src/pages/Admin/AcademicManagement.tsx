import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import { Calendar, Layers, Columns, Plus } from 'lucide-react';

export const AcademicManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [years, setYears] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'years' | 'semesters' | 'sections'>('years');
  const [showYearModal, setShowYearModal] = useState(false);
  const [showSemModal, setShowSemModal] = useState(false);
  const [showSecModal, setShowSecModal] = useState(false);

  const [yearForm, setYearForm] = useState({ name: '', startDate: '', endDate: '', status: 'Active' });
  const [semForm, setSemForm] = useState({ academicYear: '', semesterNumber: 1, startDate: '', endDate: '', status: 'Active' });
  const [secForm, setSecForm] = useState({ name: '', course: '', semester: 1, capacity: 60, academicYear: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [yrRes, semRes, secRes, cRes] = await Promise.all([
        api.get('/admin/academic-years'),
        api.get('/admin/semesters'),
        api.get('/admin/sections'),
        api.get('/admin/courses'),
      ]);
      setYears(yrRes.data.data.academicYears);
      setSemesters(semRes.data.data.semesters);
      setSections(secRes.data.data.sections);
      setCourses(cRes.data.data.courses);

      if (yrRes.data.data.academicYears.length > 0) {
        setSemForm((prev) => ({ ...prev, academicYear: yrRes.data.data.academicYears[0]._id }));
        setSecForm((prev) => ({ ...prev, academicYear: yrRes.data.data.academicYears[0]._id }));
      }
      if (cRes.data.data.courses.length > 0) {
        setSecForm((prev) => ({ ...prev, course: cRes.data.data.courses[0]._id }));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch academic settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleYearSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/academic-years', yearForm);
      setShowYearModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating year.');
    }
  };

  const handleSemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/semesters', semForm);
      setShowSemModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating semester.');
    }
  };

  const handleSecSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/sections', secForm);
      setShowSecModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating section.');
    }
  };

  return (
    <div className="space-y-6 font-bold text-xs">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Academic Calendar Setup</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">Configure academic years, semester terms, and class sections.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'years' && (
            <button onClick={() => setShowYearModal(true)} className="flex items-center gap-2 px-3 py-2 text-xs bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-md transition-all">
              <Plus className="h-4 w-4" /> Add Year
            </button>
          )}
          {activeTab === 'semesters' && (
            <button onClick={() => setShowSemModal(true)} className="flex items-center gap-2 px-3 py-2 text-xs bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-md transition-all">
              <Plus className="h-4 w-4" /> Add Semester
            </button>
          )}
          {activeTab === 'sections' && (
            <button onClick={() => setShowSecModal(true)} className="flex items-center gap-2 px-3 py-2 text-xs bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-md transition-all">
              <Plus className="h-4 w-4" /> Add Section
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button onClick={() => setActiveTab('years')} className={`pb-2 px-4 border-b-2 transition-all ${activeTab === 'years' ? 'border-primary-500 text-primary-500' : 'border-transparent text-slate-400'}`}>
          Academic Years
        </button>
        <button onClick={() => setActiveTab('semesters')} className={`pb-2 px-4 border-b-2 transition-all ${activeTab === 'semesters' ? 'border-primary-500 text-primary-500' : 'border-transparent text-slate-400'}`}>
          Semesters
        </button>
        <button onClick={() => setActiveTab('sections')} className={`pb-2 px-4 border-b-2 transition-all ${activeTab === 'sections' ? 'border-primary-500 text-primary-500' : 'border-transparent text-slate-400'}`}>
          Sections
        </button>
      </div>

      {loading ? (
        <div className="h-[40vh] flex justify-center items-center"><LoadingSpinner /></div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : activeTab === 'years' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {years.map((y) => (
            <div key={y._id} className="p-6 rounded-3xl glass-card space-y-4">
              <div className="flex justify-between items-start">
                <div className="h-10 w-10 bg-primary-500/10 text-primary-500 rounded-2xl flex items-center justify-center">
                  <Calendar className="h-5 w-5" />
                </div>
                <span className={`px-2 py-0.5 text-[10px] rounded-full ${y.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {y.status}
                </span>
              </div>
              <h3 className="text-sm font-extrabold">{y.name}</h3>
              <div className="text-[10px] text-slate-400 space-y-1 font-normal">
                <p>Start: {new Date(y.startDate).toLocaleDateString()}</p>
                <p>End: {new Date(y.endDate).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'semesters' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {semesters.map((sem) => (
            <div key={sem._id} className="p-6 rounded-3xl glass-card space-y-4">
              <div className="flex justify-between items-start">
                <div className="h-10 w-10 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center">
                  <Layers className="h-5 w-5" />
                </div>
                <span className={`px-2 py-0.5 text-[10px] rounded-full ${sem.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {sem.status}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-extrabold">Semester {sem.semesterNumber}</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Year: {sem.academicYear?.name}</p>
              </div>
              <div className="text-[10px] text-slate-400 space-y-1 font-normal">
                <p>Start: {new Date(sem.startDate).toLocaleDateString()}</p>
                <p>End: {new Date(sem.endDate).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((sec) => (
            <div key={sec._id} className="p-6 rounded-3xl glass-card space-y-4">
              <div className="flex justify-between items-start">
                <div className="h-10 w-10 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
                  <Columns className="h-5 w-5" />
                </div>
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-100 dark:bg-slate-800 border">
                  Capacity: {sec.capacity}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-extrabold">Section {sec.name}</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Course: {sec.course?.name}</p>
                <p className="text-[10px] text-slate-400 font-semibold">Semester: {sec.semester} | Year: {sec.academicYear?.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALS */}
      {showYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-extrabold border-b pb-2">Create Academic Year</h3>
            <form onSubmit={handleYearSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase text-slate-400">Name (e.g. 2024-2025)</label>
                <input required type="text" value={yearForm.name} onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-slate-400">Start Date</label>
                  <input required type="date" value={yearForm.startDate} onChange={(e) => setYearForm({ ...yearForm, startDate: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400">End Date</label>
                  <input required type="date" value={yearForm.endDate} onChange={(e) => setYearForm({ ...yearForm, endDate: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowYearModal(false)} className="px-4 py-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-extrabold border-b pb-2">Create Semester Term</h3>
            <form onSubmit={handleSemSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-slate-400">Academic Year</label>
                  <select value={semForm.academicYear} onChange={(e) => setSemForm({ ...semForm, academicYear: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none">
                    {years.map((y) => (
                      <option key={y._id} value={y._id}>{y.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400">Semester Number</label>
                  <input required type="number" min={1} max={8} value={semForm.semesterNumber} onChange={(e) => setSemForm({ ...semForm, semesterNumber: parseInt(e.target.value) || 1 })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-slate-400">Start Date</label>
                  <input required type="date" value={semForm.startDate} onChange={(e) => setSemForm({ ...semForm, startDate: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400">End Date</label>
                  <input required type="date" value={semForm.endDate} onChange={(e) => setSemForm({ ...semForm, endDate: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowSemModal(false)} className="px-4 py-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSecModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-extrabold border-b pb-2">Create Section Class</h3>
            <form onSubmit={handleSecSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-slate-400">Section Name (e.g. A)</label>
                  <input required type="text" value={secForm.name} onChange={(e) => setSecForm({ ...secForm, name: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400">Capacity</label>
                  <input required type="number" value={secForm.capacity} onChange={(e) => setSecForm({ ...secForm, capacity: parseInt(e.target.value) || 60 })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase text-slate-400">Associated Course</label>
                <select value={secForm.course} onChange={(e) => setSecForm({ ...secForm, course: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none">
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-slate-400">Semester Number</label>
                  <input required type="number" min={1} max={8} value={secForm.semester} onChange={(e) => setSecForm({ ...secForm, semester: parseInt(e.target.value) || 1 })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400">Academic Year</label>
                  <select value={secForm.academicYear} onChange={(e) => setSecForm({ ...secForm, academicYear: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none">
                    {years.map((y) => (
                      <option key={y._id} value={y._id}>{y.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowSecModal(false)} className="px-4 py-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AcademicManagement;
