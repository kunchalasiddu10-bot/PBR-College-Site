import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import { Search, UserPlus, FileSpreadsheet, Lock, AlertTriangle, Edit2, Trash2, X } from 'lucide-react';

export const StudentsManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    admissionNumber: '',
    department: '',
    currentSemester: 1,
    section: 'A',
    academicYear: '2024-2028',
  });

  const [csvText, setCsvText] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/students?page=${page}&search=${search}&department=${deptFilter}`);
      setStudents(res.data.data.students);
      setTotalPages(res.data.data.pagination.pages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch student registers.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepts = async () => {
    try {
      const res = await api.get('/admin/departments');
      setDepartments(res.data.data.departments);
    } catch (err) {
      // Silent catch
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, deptFilter]);

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/students', formData);
      setShowAddModal(false);
      setPage(1);
      fetchStudents();
      resetForm();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating student.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch(`/admin/students/${formData.id}`, formData);
      setShowEditModal(false);
      fetchStudents();
      resetForm();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating student.');
    }
  };

  const handleImportCSVSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simple parse of CSV text
      const lines = csvText.trim().split('\n');
      const parsedStudents = [];
      for (const line of lines) {
        const parts = line.split(',');
        if (parts.length >= 7) {
          parsedStudents.push({
            name: parts[0].trim(),
            email: parts[1].trim(),
            password: parts[2].trim(),
            rollNumber: parts[3].trim(),
            admissionNumber: parts[4].trim(),
            department: parts[5].trim(), // department ID string
            currentSemester: parseInt(parts[6].trim()) || 1,
            section: parts[7]?.trim() || 'A',
            academicYear: parts[8]?.trim() || '2024-2028',
          });
        }
      }

      await api.post('/admin/students/import', { students: parsedStudents });
      setShowCSVModal(false);
      setPage(1);
      fetchStudents();
      setCsvText('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error importing CSV data.');
    }
  };

  const toggleSuspension = async (id: string, currentStatus: string) => {
    try {
      const targetStatus = currentStatus === 'Suspended' ? 'Active' : 'Suspended';
      await api.patch(`/admin/students/${id}/suspend`, { status: targetStatus });
      fetchStudents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error toggling student suspension.');
    }
  };

  const resetPassword = async (id: string) => {
    const newPass = prompt('Enter new password (leaves default to Password@123 if empty):');
    try {
      await api.patch(`/admin/students/${id}/reset-password`, { password: newPass });
      alert('Password reset completed successfully.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error resetting password.');
    }
  };

  const deleteStudent = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this student permanently?')) return;
    try {
      await api.delete(`/admin/students/${id}`);
      fetchStudents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting student.');
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      email: '',
      password: '',
      rollNumber: '',
      admissionNumber: '',
      department: departments[0]?._id || '',
      currentSemester: 1,
      section: 'A',
      academicYear: '2024-2028',
    });
  };

  const openEditModal = (student: any) => {
    setFormData({
      id: student._id,
      name: student.user?.name || '',
      email: student.user?.email || '',
      password: '',
      rollNumber: student.rollNumber,
      admissionNumber: student.admissionNumber,
      department: student.department?._id || '',
      currentSemester: student.currentSemester,
      section: student.section,
      academicYear: student.academicYear,
    });
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Roster Students</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">Configure student enrollments, status, password resets, and sections.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-md transition-all"
          >
            <UserPlus className="h-4 w-4" /> Add Student
          </button>
          <button
            onClick={() => setShowCSVModal(true)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-350 dark:hover:bg-slate-700 rounded-xl transition-all"
          >
            <FileSpreadsheet className="h-4 w-4" /> Import CSV
          </button>
        </div>
      </div>

      {/* Filtering & Search Bar */}
      <div className="p-4 rounded-2xl glass-card flex flex-col md:flex-row gap-4 items-center">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2 w-full">
          <input
            type="text"
            placeholder="Search by name, email, roll number, admission number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-slate-100 dark:bg-slate-800 border px-3 py-2.5 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <button type="submit" className="px-4 py-2 text-xs font-bold bg-slate-200 dark:bg-slate-700 rounded-xl hover:bg-slate-350 dark:hover:bg-slate-600">
            <Search className="h-4 w-4" />
          </button>
        </form>

        <div className="w-full md:w-48">
          <select
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
            className="w-full text-xs bg-slate-100 dark:bg-slate-800 border px-3 py-2.5 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none font-bold"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Student Register Grid */}
      {loading ? (
        <div className="h-[40vh] flex justify-center items-center"><LoadingSpinner /></div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : students.length === 0 ? (
        <div className="text-center py-12 border rounded-3xl glass-card">
          <p className="text-slate-400 font-bold text-sm">No students matched the filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg">
          <table className="w-full text-left text-xs bg-white dark:bg-slate-900">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-400 uppercase tracking-widest text-[9px] font-bold">
              <tr>
                <th className="px-6 py-4">Student Profile</th>
                <th className="px-6 py-4">Identifiers</th>
                <th className="px-6 py-4">Department & Class</th>
                <th className="px-6 py-4">Enrollment Year</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4 text-center">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-850">
              {students.map((student) => (
                <tr key={student._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 font-bold">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-950/20 text-primary-500 uppercase flex items-center justify-center font-extrabold text-sm shrink-0">
                      {student.user?.profileImage ? (
                        <img src={student.user.profileImage} alt="" className="h-full w-full object-cover rounded-full" />
                      ) : (
                        student.user?.name[0]
                      )}
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-white font-extrabold">{student.user?.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold lowercase">{student.user?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 space-y-0.5">
                    <p><span className="text-[9px] text-slate-400 uppercase">Roll:</span> {student.rollNumber}</p>
                    <p><span className="text-[9px] text-slate-400 uppercase">Adm:</span> {student.admissionNumber}</p>
                  </td>
                  <td className="px-6 py-4 space-y-0.5">
                    <p className="text-slate-800 dark:text-slate-200">{student.department?.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Semester {student.currentSemester} Section {student.section}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{student.academicYear}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                      student.user?.status === 'Active'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {student.user?.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => openEditModal(student)} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => resetPassword(student._id)} className="p-1.5 text-orange-400 hover:text-orange-500 rounded-lg hover:bg-orange-50/20" title="Reset Password">
                        <Lock className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => toggleSuspension(student._id, student.user?.status)} className="p-1.5 text-yellow-500 hover:text-yellow-600 rounded-lg hover:bg-yellow-50/20" title="Toggle Suspend">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deleteStudent(student._id)} className="p-1.5 text-red-500 hover:text-red-650 rounded-lg hover:bg-red-50/20" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-end gap-2 font-bold text-xs mt-4">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50">Prev</button>
          <span className="px-3 py-1.5 self-center">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50">Next</button>
        </div>
      )}

      {/* MODAL: ADD STUDENT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto font-bold text-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-extrabold">Register New Student Profile</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Full Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">Email Address</label>
                  <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">Account Password</label>
                  <input required type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">Roll Number</label>
                  <input required type="text" value={formData.rollNumber} onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">Admission Number</label>
                  <input required type="text" value={formData.admissionNumber} onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Department</label>
                <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none">
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">Semester</label>
                  <input required type="number" min={1} max={8} value={formData.currentSemester} onChange={(e) => setFormData({ ...formData, currentSemester: parseInt(e.target.value) || 1 })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">Section</label>
                  <input required type="text" value={formData.section} onChange={(e) => setFormData({ ...formData, section: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">Academic Year</label>
                  <input required type="text" value={formData.academicYear} onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
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

      {/* MODAL: EDIT STUDENT */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto font-bold text-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-extrabold">Edit Student Profile Details</h3>
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
                  <label className="text-[10px] uppercase text-slate-400">Roll Number</label>
                  <input required type="text" value={formData.rollNumber} onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">Admission Number</label>
                  <input required type="text" value={formData.admissionNumber} onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Department</label>
                <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none">
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">Semester</label>
                  <input required type="number" min={1} max={8} value={formData.currentSemester} onChange={(e) => setFormData({ ...formData, currentSemester: parseInt(e.target.value) || 1 })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">Section</label>
                  <input required type="text" value={formData.section} onChange={(e) => setFormData({ ...formData, section: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">Academic Year</label>
                  <input required type="text" value={formData.academicYear} onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl focus:outline-none" />
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

      {/* MODAL: IMPORT CSV */}
      {showCSVModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl shadow-xl w-full max-w-lg p-6 font-bold text-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-extrabold">Bulk Import Student Profiles</h3>
              <button onClick={() => setShowCSVModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={handleImportCSVSubmit} className="space-y-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/25 rounded-2xl text-blue-500 text-[10px]">
                <p>Provide comma-separated values matching this template (one row per student):</p>
                <p className="font-mono mt-1 select-all">Name, Email, Password, RollNumber, AdmissionNumber, DepartmentID, Semester, Section, AcademicYear</p>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">CSV Data</label>
                <textarea
                  required
                  rows={6}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="e.g. Alice Doe,alice@college.edu,SecretPass123,CS2024002,ADM-2024-8833,65efd8120fa26f0012bc0b9f,3,A,2024-2028"
                  className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl font-mono text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowCSVModal(false)} className="px-4 py-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600">Import Bulk</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentsManagement;
