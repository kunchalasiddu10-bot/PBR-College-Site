import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';

export const FacultyResults: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [examType, setExamType] = useState<string>('Mid-Term 1');
  const [maxMarks, setMaxMarks] = useState<number>(100);
  const [students, setStudents] = useState<any[]>([]);

  // Key is student._id, values are marks obtained & grade
  const [marksState, setMarksState] = useState<Record<string, { marks: number; grade: string }>>({});

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
        const activeClass = classes.find((c) => c._id === selectedClass);
        if (!activeClass) return;

        const res = await api.get('/faculty/students');
        const sectionName = activeClass.section?.name;
        const filtered = res.data.data.students.filter(
          (s: any) => s.section === sectionName
        );

        setStudents(filtered);

        // Prepopulate marks
        const initialMarks: Record<string, { marks: number; grade: string }> = {};
        filtered.forEach((s: any) => {
          initialMarks[s._id] = { marks: 0, grade: 'A' };
        });
        setMarksState(initialMarks);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to retrieve students roster.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass, classes]);

  const handleMarkChange = (studentId: string, val: number) => {
    setMarksState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marks: val
      }
    }));
  };

  const handleGradeChange = (studentId: string, val: string) => {
    setMarksState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        grade: val
      }
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

      const resultsData = Object.keys(marksState).map((studentId) => ({
        studentId,
        marksObtained: marksState[studentId].marks,
        maxMarks,
        grade: marksState[studentId].grade
      }));

      await api.post('/faculty/results', {
        subjectId: activeClass.subject?._id,
        semester: activeClass.section?.semester || 3,
        examType,
        resultsData
      });

      setMsg('Grades & exam results logged successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit grade transcripts.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading && classes.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-400">Loading grading panels...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Grade Entry
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Post scores, compile midterm results, and catalog term letter grades.
        </p>
      </div>

      {msg && <Alert type="success" message={msg} />}
      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Class Target</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
            >
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.subject?.name} - Sec {c.section?.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Exam Category</label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
            >
              {['Mid-Term 1', 'Mid-Term 2', 'Lab Internal', 'Lab External', 'Semester End'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Maximum Marks</label>
            <input
              type="number"
              value={maxMarks}
              onChange={(e) => setMaxMarks(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
            />
          </div>
        </div>

        {/* Grades Table */}
        <div className="p-6 rounded-3xl glass-card space-y-4">
          <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Class Grade Sheet</h3>
          {students.length === 0 ? (
            <p className="text-xs text-slate-400 font-semibold py-8 text-center">No students registered in this section.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                    <th className="pb-3 pl-2">Roll Number</th>
                    <th className="pb-3">Student Name</th>
                    <th className="pb-3 text-center w-32">Marks Obtained</th>
                    <th className="pb-3 text-right pr-4 w-32">Designated Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {students.map((student) => (
                    <tr key={student._id} className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      <td className="py-4 pl-2 font-mono text-primary-500">{student.rollNumber}</td>
                      <td className="py-4">{student.user?.name}</td>
                      <td className="py-4 text-center">
                        <input
                          type="number"
                          min={0}
                          max={maxMarks}
                          value={marksState[student._id]?.marks || 0}
                          onChange={(e) => handleMarkChange(student._id, Number(e.target.value))}
                          className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-850 border rounded text-center focus:outline-none"
                        />
                      </td>
                      <td className="py-4 text-right pr-4">
                        <select
                          value={marksState[student._id]?.grade || 'A'}
                          onChange={(e) => handleGradeChange(student._id, e.target.value)}
                          className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-850 border rounded focus:outline-none"
                        >
                          {['O', 'A', 'B', 'C', 'D', 'F'].map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
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
                  <Save className="h-4.5 w-4.5" /> Save Grades and Results
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default FacultyResults;
