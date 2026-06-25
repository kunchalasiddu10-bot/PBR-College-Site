import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';

export const FacultyAttendance: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );

  // Key is student._id, value is 'Present' | 'Absent' | 'Late'
  const [attendanceState, setAttendanceState] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({});

  useEffect(() => {
    const fetchAssignedClasses = async () => {
      try {
        setLoading(true);
        const res = await api.get('/faculty/assigned-classes');
        setClasses(res.data.data.assignments);
        if (res.data.data.assignments.length > 0) {
          setSelectedClass(res.data.data.assignments[0]._id);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch assigned classes.');
      } finally {
        setLoading(false);
      }
    };
    fetchAssignedClasses();
  }, []);

  useEffect(() => {
    if (!selectedClass) return;

    const fetchStudents = async () => {
      try {
        setLoading(true);
        // Get class details
        const activeClass = classes.find((c) => c._id === selectedClass);
        if (!activeClass) return;

        const res = await api.get('/faculty/students');
        // Filter student list by the selected class section
        const sectionName = activeClass.section?.name;
        const filtered = res.data.data.students.filter(
          (s: any) => s.section === sectionName
        );

        setStudents(filtered);

        // Prepopulate attendance state to 'Present'
        const initialStates: Record<string, 'Present' | 'Absent' | 'Late'> = {};
        filtered.forEach((s: any) => {
          initialStates[s._id] = 'Present';
        });
        setAttendanceState(initialStates);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to retrieve class students roster.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass, classes]);

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;

    const activeClass = classes.find((c) => c._id === selectedClass);
    if (!activeClass) return;

    try {
      setSubmitLoading(true);
      setError(null);
      setMsg(null);

      const attendanceData = Object.keys(attendanceState).map((studentId) => ({
        studentId,
        status: attendanceState[studentId]
      }));

      await api.post('/faculty/attendance', {
        subjectId: activeClass.subject?._id,
        semester: activeClass.section?.semester || 3,
        section: activeClass.section?.name,
        date: attendanceDate,
        attendanceData
      });

      setMsg('Attendance register uploaded successfully and notices broadcasted!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit attendance roster.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading && classes.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-400">Loading attendance scheduler...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Mark Attendance
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Select assigned academic classes, verify student registers, and record attendance logs.
        </p>
      </div>

      {msg && <Alert type="success" message={msg} />}
      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Class Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Class Allocation</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
            >
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.subject?.name} ({c.subject?.code}) - Sec {c.section?.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Register Date</label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
            />
          </div>
        </div>

        {/* Student Register Table */}
        <div className="p-6 rounded-3xl glass-card space-y-4">
          <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Student List Register</h3>
          {students.length === 0 ? (
            <p className="text-xs text-slate-400 font-semibold py-8 text-center">No students registered in this section.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                    <th className="pb-3 pl-2">Roll Number</th>
                    <th className="pb-3">Student Name</th>
                    <th className="pb-3 text-right pr-4">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {students.map((student) => (
                    <tr key={student._id} className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      <td className="py-4 pl-2 font-mono text-primary-500">{student.rollNumber}</td>
                      <td className="py-4">{student.user?.name}</td>
                      <td className="py-4 text-right pr-4">
                        <div className="inline-flex gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border">
                          {(['Present', 'Absent', 'Late'] as const).map((status) => {
                            const active = attendanceState[student._id] === status;
                            return (
                              <button
                                type="button"
                                key={status}
                                onClick={() => handleStatusChange(student._id, status)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-extrabold transition-all ${
                                  active
                                    ? status === 'Present'
                                      ? 'bg-green-500 text-white'
                                      : status === 'Absent'
                                      ? 'bg-red-500 text-white'
                                      : 'bg-yellow-500 text-slate-900'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                }`}
                              >
                                {status}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {students.length > 0 && (
          <div className="flex justify-end">
            <Button type="submit" disabled={submitLoading} className="flex items-center gap-2">
              {submitLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Save className="h-4.5 w-4.5" /> Save Attendance Log
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default FacultyAttendance;
