import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import { Building2, Plus, Edit2, Trash2, ShieldAlert, X } from 'lucide-react';

export const DepartmentManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHodModal, setShowHodModal] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    code: '',
    description: '',
  });

  const [hodData, setHodData] = useState({
    departmentCode: '',
    facultyId: '',
  });

  const fetchDepts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/departments');
      setDepartments(res.data.data.departments);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch departments.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculty = async () => {
    try {
      const res = await api.get('/admin/faculty');
      setFaculty(res.data.data.faculty);
    } catch (err) {}
  };

  useEffect(() => {
    fetchDepts();
    fetchFaculty();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/departments', formData);
      setShowAddModal(false);
      fetchDepts();
      resetForm();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating department.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch(`/admin/departments/${formData.id}`, formData);
      setShowEditModal(false);
      fetchDepts();
      resetForm();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating department.');
    }
  };

  const handleHodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/departments/assign-hod', hodData);
      setShowHodModal(false);
      fetchDepts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error assigning HOD.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this department? All linked courses and subjects may become orphaned.')) return;
    try {
      await api.delete(`/admin/departments/${id}`);
      fetchDepts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting department.');
    }
  };

  const resetForm = () => {
    setFormData({ id: '', name: '', code: '', description: '' });
  };

  const openEditModal = (d: any) => {
    setFormData({
      id: d._id,
      name: d.name,
      code: d.code,
      description: d.description || '',
    });
    setShowEditModal(true);
  };

  const openHodModal = (d: any) => {
    setHodData({
      departmentCode: d.code,
      facultyId: faculty[0]?._id || '',
    });
    setShowHodModal(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">College Departments</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">Add division faculties, appoint HOD positions, and view enrollments.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-md transition-all"
        >
          <Plus className="h-4 w-4" /> Add Department
        </button>
      </div>

      {loading ? (
        <div className="h-[40vh] flex justify-center items-center"><LoadingSpinner /></div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-bold text-xs">
          {departments.map((d) => (
            <div key={d._id} className="p-6 rounded-3xl glass-card space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 bg-primary-500/10 text-primary-500 rounded-2xl flex items-center justify-center">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border">
                    {d.code}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{d.name}</h3>
                  <p className="text-[10px] font-semibold text-slate-400 leading-relaxed font-normal">{d.description || 'No division description provided.'}</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400 uppercase">Head of Dept (HOD):</span>
                    <span className="text-slate-800 dark:text-slate-200">{d.hod?.name || 'Unassigned'}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400 uppercase">Enrolled Students:</span>
                    <span className="text-slate-800 dark:text-slate-200">{d.studentCount}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400 uppercase">Mapped Subjects:</span>
                    <span className="text-slate-800 dark:text-slate-200">{d.subjectCount}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end border-t pt-3">
                <button onClick={() => openEditModal(d)} className="px-3 py-1.5 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850">
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => openHodModal(d)} className="px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500/25 flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" /> Set HOD
                </button>
                <button onClick={() => handleDelete(d._id)} className="px-3 py-1.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/25">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ADD DEPT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl shadow-xl w-full max-w-md p-6 font-bold text-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-extrabold">Add New Academic Department</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Department Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Department Code</label>
                <input required type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Description</label>
                <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none resize-none" />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT DEPT */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl shadow-xl w-full max-w-md p-6 font-bold text-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-extrabold">Edit Department Parameters</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Department Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Department Code</label>
                <input required type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Description</label>
                <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none resize-none" />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN HOD */}
      {showHodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl shadow-xl w-full max-w-md p-6 font-bold text-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-extrabold">Appoint Department Head</h3>
              <button onClick={() => setShowHodModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={handleHodSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Faculty Instructor</label>
                <select value={hodData.facultyId} onChange={(e) => setHodData({ ...hodData, facultyId: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none">
                  {faculty.map((f) => (
                    <option key={f._id} value={f._id}>{f.name} ({f.email})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowHodModal(false)} className="px-4 py-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600">Assign Authority</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DepartmentManagement;
