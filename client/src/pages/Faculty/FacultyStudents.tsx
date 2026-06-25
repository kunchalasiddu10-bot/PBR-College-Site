import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Shield } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';

export const FacultyStudents: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await api.get('/faculty/students');
        setStudents(res.data.data.students);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch student directory.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filtered = students.filter(
    (s: any) =>
      s.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && students.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-400">Loading student directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Students Roster
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Search and view student profiles enrolled in your academic section courses.
        </p>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Search Filter */}
      <div className="max-w-md">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by student name or roll number..."
          className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
        />
      </div>

      {/* Grid of student profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl glass-card space-y-2">
            <Users className="h-10 w-10 mx-auto text-slate-400" />
            <p className="text-xs font-semibold text-slate-400">No student profiles found.</p>
          </div>
        ) : (
          filtered.map((student) => (
            <div key={student._id} className="p-6 rounded-3xl glass-card space-y-4 hover:shadow-md transition">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary-500/10 border border-primary-500/20 overflow-hidden flex items-center justify-center text-lg font-extrabold text-primary-500 uppercase">
                  {student.user?.profileImage ? (
                    <img src={student.user.profileImage} alt={student.user.name} className="h-full w-full object-cover" />
                  ) : (
                    student.user?.name[0]
                  )}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-base font-extrabold text-slate-800 dark:text-white truncate">{student.user?.name}</h4>
                  <p className="text-xs text-primary-500 font-mono font-bold uppercase tracking-wider">{student.rollNumber}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/40 dark:border-slate-800/40 text-xs font-bold text-slate-500 space-y-2.5">
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-slate-400" /> Section {student.section} • Semester {student.currentSemester}
                </span>
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" /> {student.user?.email}
                </span>
                {student.user?.phoneNumber && (
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" /> {student.user.phoneNumber}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FacultyStudents;
