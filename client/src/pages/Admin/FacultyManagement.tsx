import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import { Search, UserPlus, BookOpen, Edit2, ShieldAlert, X } from 'lucide-react';

export const FacultyManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    department: '',
    role: 'Faculty',
  });

  const [assignData, setAssignData] = useState({
    facultyId: '',
    subjectId: '',
    sectionId: '',
    academicYearId: '',
  });

  const [subjects, setSubjects] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/faculty?search=${search}`);
      setFaculty(res.data.data.faculty);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch faculty registers.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepts = async () => {
    try {
      const res = await api.get('/admin/departments');
      setDepartments(res.data.data.departments);
    } catch (err) {}
  };

  const fetchAcademicData = async () => {
    try {
      const [subRes, secRes, yrRes] = await Promise.all([
        api.get('/admin/subjects'),
        api.get('/admin/sections'),
        api.get('/admin/academic-years'),
      ]);
      setSubjects(subRes.data.data.subjects);
      setSections(secRes.data.data.sections);
      setYears(yrRes.data.data.academicYears);
    } catch (err) {}
  };

  useEffect(() => {
    fetchFaculty();
    fetchDepts();
    fetchAcademicData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFaculty();
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/faculty', formData);
      setShowAddModal(false);
      fetchFaculty();
      resetForm();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating faculty.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch(`/admin/faculty/${formData.id}`, formData);
      setShowEditModal(false);
      fetchFaculty();
      resetForm();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating faculty.');
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/faculty/assign', assignData);
      setShowAssignModal(false);
      fetchFaculty();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error assigning class.');
    }
  };

  const toggleDeactivate = async (id: string, currentStatus: string) => {
    try {
      const targetStatus = currentStatus === 'Disabled' ? 'Active' : 'Disabled';
      await api.patch(`/admin/faculty/${id}/deactivate`, { status: targetStatus });
      fetchFaculty();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error toggling account activation.');
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      email: '',
      password: '',
      department: departments[0]?.code || '',
      role: 'Faculty',
    });
  };

  const openEditModal = (member: any) => {
    setFormData({
      id: member._id,
      name: member.name,
      email: member.email,
      password: '',
      department: member.department,
      role: member.role,
    });
    setShowEditModal(true);
  };

  const openAssignModal = (member: any) => {
    setAssignData({
      facultyId: member._id,
      subjectId: subjects[0]?._id || '',
      sectionId: sections[0]?._id || '',
      academicYearId: years[0]?._id || '',
    });
    setShowAssignModal(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Faculty Directory</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">Manage instructor accounts, assign classes, and set HOD authorities.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-md transition-all"
          >
            <UserPlus className="h-4 w-4" /> Add Faculty Account
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl glass-card">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full">
          <input
            type="text"
            placeholder="Search by instructor name, email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-slate-100 dark:bg-slate-800 border px-3 py-2.5 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <button type="submit" className="px-4 py-2 text-xs font-bold bg-slate-200 dark:bg-slate-700 rounded-xl hover:bg-slate-350 dark:hover:bg-slate-600">
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Roster Table */}
      {loading ? (
        <div className="h-[40vh] flex justify-center items-center"><LoadingSpinner /></div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : faculty.length === 0 ? (
        <div className="text-center py-12 border rounded-3xl glass-card">
          <p className="text-slate-400 font-bold text-sm">No faculty members found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg">
          <table className="w-full text-left text-xs bg-white dark:bg-slate-900">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-400 uppercase tracking-widest text-[9px] font-bold">
              <tr>
                <th className="px-6 py-4">Faculty Member</th>
                <th className="px-6 py-4">Department & Role</th>
                <th className="px-6 py-4">Assigned Subjects</th>
                <th className="px-6 py-4">Last Login</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4 text-center">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-850">
              {faculty.map((member) => (
                <tr key={member._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 font-bold">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-purple-100 dark:bg-purple-950/20 text-purple-500 uppercase flex items-center justify-center font-extrabold text-sm shrink-0">
                      {member.name[0]}
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-white font-extrabold">{member.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold lowercase">{member.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 space-y-0.5">
                    <p className="text-slate-800 dark:text-slate-200">{member.department || 'N/A'}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{member.role}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-blue-500/10 text-blue-500">
                      {member.assignmentsCount} subjects assigned
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : 'Never'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                      member.status === 'Active'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => openEditModal(member)} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => openAssignModal(member)} className="p-1.5 text-primary-500 hover:text-primary-650 rounded-lg hover:bg-primary-50/20" title="Assign Subject">
                        <BookOpen className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => toggleDeactivate(member._id, member.status)} className="p-1.5 text-red-500 hover:text-red-650 rounded-lg hover:bg-red-50/20" title="Toggle Lock">
                        <ShieldAlert className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: ADD FACULTY */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl shadow-xl w-full max-w-md p-6 font-bold text-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-extrabold">Add New Faculty Account</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Full Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Email Address</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Initial Password</label>
                <input required type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">Department</label>
                  <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none">
                    <option value="">Choose Dept</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d.code}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">Role</label>
                  <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none">
                    <option value="Faculty">Faculty</option>
                    <option value="HOD">HOD</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT FACULTY */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl shadow-xl w-full max-w-md p-6 font-bold text-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-extrabold">Edit Faculty Details</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Full Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Email Address</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">Department Code</label>
                  <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none">
                    <option value="">Choose Dept</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d.code}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">Role</label>
                  <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none">
                    <option value="Faculty">Faculty</option>
                    <option value="HOD">HOD</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN SUBJECT */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl shadow-xl w-full max-w-md p-6 font-bold text-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-extrabold">Assign Class and Subject</h3>
              <button onClick={() => setShowAssignModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Subject</label>
                <select value={assignData.subjectId} onChange={(e) => setAssignData({ ...assignData, subjectId: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none">
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Class Section</label>
                <select value={assignData.sectionId} onChange={(e) => setAssignData({ ...assignData, sectionId: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none">
                  {sections.map((sec) => (
                    <option key={sec._id} value={sec._id}>Sem {sec.semester} - Section {sec.name} ({sec.course?.code})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Academic Year</label>
                <select value={assignData.academicYearId} onChange={(e) => setAssignData({ ...assignData, academicYearId: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none">
                  {years.map((y) => (
                    <option key={y._id} value={y._id}>{y.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600">Assign Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FacultyManagement;
