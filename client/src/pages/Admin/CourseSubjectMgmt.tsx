import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import { Bookmark, Plus, Layers, X } from 'lucide-react';

export const CourseSubjectMgmt: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'courses' | 'subjects'>('courses');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    description: '',
    credits: 24,
    department: '',
    durationYears: 4,
  });

  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    credits: 4,
    department: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, sRes, dRes] = await Promise.all([
        api.get('/admin/courses'),
        api.get('/admin/subjects'),
        api.get('/admin/departments'),
      ]);
      setCourses(cRes.data.data.courses);
      setSubjects(sRes.data.data.subjects);
      setDepartments(dRes.data.data.departments);

      if (dRes.data.data.departments.length > 0) {
        setCourseForm((prev) => ({ ...prev, department: dRes.data.data.departments[0]._id }));
        setSubjectForm((prev) => ({ ...prev, department: dRes.data.data.departments[0]._id }));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch academic items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/courses', courseForm);
      setShowCourseModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating course.');
    }
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/subjects', subjectForm);
      setShowSubjectModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating subject.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Curriculum Management</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">Configure degrees, credits, class structures, and courses.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'courses' ? (
            <button onClick={() => setShowCourseModal(true)} className="flex items-center gap-2 px-3 py-2 text-xs font-bold bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-md transition-all">
              <Plus className="h-4 w-4" /> Add Degree Course
            </button>
          ) : (
            <button onClick={() => setShowSubjectModal(true)} className="flex items-center gap-2 px-3 py-2 text-xs font-bold bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-md transition-all">
              <Plus className="h-4 w-4" /> Add Subject Syllabus
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b font-bold text-xs">
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-2 px-4 border-b-2 transition-all ${
            activeTab === 'courses' ? 'border-primary-500 text-primary-500' : 'border-transparent text-slate-400'
          }`}
        >
          Courses (Degrees)
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`pb-2 px-4 border-b-2 transition-all ${
            activeTab === 'subjects' ? 'border-primary-500 text-primary-500' : 'border-transparent text-slate-400'
          }`}
        >
          Subjects (Syllabus)
        </button>
      </div>

      {loading ? (
        <div className="h-[40vh] flex justify-center items-center"><LoadingSpinner /></div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : activeTab === 'courses' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-bold text-xs">
          {courses.map((c) => (
            <div key={c._id} className="p-6 rounded-3xl glass-card space-y-4">
              <div className="flex justify-between items-start">
                <div className="h-10 w-10 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
                  <Layers className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border">
                  {c.code}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{c.name}</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">{c.department?.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t pt-3 text-[10px]">
                <div>
                  <p className="text-slate-400 uppercase">Credits Limit</p>
                  <p className="text-slate-800 dark:text-slate-200 text-xs mt-0.5">{c.credits} Credits</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase">Duration</p>
                  <p className="text-slate-800 dark:text-slate-200 text-xs mt-0.5">{c.durationYears} Years</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-bold text-xs">
          {subjects.map((sub) => (
            <div key={sub._id} className="p-6 rounded-3xl glass-card space-y-4">
              <div className="flex justify-between items-start">
                <div className="h-10 w-10 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center">
                  <Bookmark className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border">
                  {sub.code}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{sub.name}</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">{sub.department?.name}</p>
              </div>
              <div className="border-t pt-3 text-[10px]">
                <p className="text-slate-400 uppercase">Subject Weight</p>
                <p className="text-slate-800 dark:text-slate-200 text-xs mt-0.5">{sub.credits} Credits</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALS */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl shadow-xl w-full max-w-md p-6 font-bold text-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-extrabold">Add Degree Course</h3>
              <button onClick={() => setShowCourseModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleCourseSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase text-slate-400">Course Name</label>
                <input required type="text" value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-slate-400">Course Code</label>
                  <input required type="text" value={courseForm.code} onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400">Total Credits</label>
                  <input required type="number" value={courseForm.credits} onChange={(e) => setCourseForm({ ...courseForm, credits: parseInt(e.target.value) || 0 })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-slate-400">Department</label>
                  <select value={courseForm.department} onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none">
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400">Duration (Years)</label>
                  <input required type="number" min={1} max={5} value={courseForm.durationYears} onChange={(e) => setCourseForm({ ...courseForm, durationYears: parseInt(e.target.value) || 4 })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowCourseModal(false)} className="px-4 py-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl shadow-xl w-full max-w-md p-6 font-bold text-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-extrabold">Add New Syllabus Subject</h3>
              <button onClick={() => setShowSubjectModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleSubjectSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase text-slate-400">Subject Name</label>
                <input required type="text" value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-slate-400">Subject Code</label>
                  <input required type="text" value={subjectForm.code} onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400">Credits Weight</label>
                  <input required type="number" min={1} value={subjectForm.credits} onChange={(e) => setSubjectForm({ ...subjectForm, credits: parseInt(e.target.value) || 0 })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase text-slate-400">Department</label>
                <select value={subjectForm.department} onChange={(e) => setSubjectForm({ ...subjectForm, department: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none">
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowSubjectModal(false)} className="px-4 py-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CourseSubjectMgmt;
