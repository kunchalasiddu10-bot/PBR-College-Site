import React, { useState, useEffect } from 'react';
import { Award, GraduationCap, CheckCircle } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const StudentResults: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await api.get('/student/results');
        setResults(response.data.data.results);
        setSummary(response.data.data.academicPerformanceSummary);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch academic grades.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-400">Loading grade results...</p>
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} className="max-w-2xl mx-auto" />;
  }

  // Calculate Semester GPA
  const semesters = Array.from(new Set(results.map((r) => r.semester))).sort();
  const gpaBySemester = semesters.map((sem) => {
    const semResults = results.filter((r) => r.semester === sem);
    let totalGradePoints = 0;
    let totalCredits = 0;

    const gradePointsMap: { [key: string]: number } = {
      O: 10,
      A: 9,
      B: 8,
      C: 7,
      D: 6,
      F: 0,
    };

    semResults.forEach((r) => {
      const credits = r.subject?.credits || 3;
      const points = gradePointsMap[r.grade] || 8; // fallback to B
      totalGradePoints += points * credits;
      totalCredits += credits;
    });

    const gpa = totalCredits > 0 ? parseFloat((totalGradePoints / totalCredits).toFixed(2)) : 0.0;

    return {
      semester: `Sem ${sem}`,
      gpa,
    };
  });

  const chartData = {
    labels: gpaBySemester.map((g) => g.semester),
    datasets: [
      {
        label: 'GPA',
        data: gpaBySemester.map((g) => g.gpa),
        borderColor: '#0e90e9',
        backgroundColor: 'rgba(14, 144, 233, 0.1)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#0272c7',
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: { min: 0, max: 10 },
    },
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Grade Transcripts
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Review graded semester exams, credit requirements, and GPA statistics.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Cumulative CGPA</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {summary?.cgpa?.toFixed(2)}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Average overall semesters</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
            <GraduationCap className="h-6 w-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Credits Earned</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {summary?.creditsCompleted}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Required for Degree: 160</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Academic Standing</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">Active</p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Eligible for registration</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Award className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Chart & Detailed Semesters List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* GPA Chart Panel (Span 1) */}
        <div className="p-6 rounded-3xl glass-card space-y-4">
          <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Semester Progress</h3>
          {gpaBySemester.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <p className="text-center text-xs text-slate-400 py-12">No semesters graded yet</p>
          )}
        </div>

        {/* Semesters Detailed Table (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {semesters.map((sem) => {
            const semResults = results.filter((r) => r.semester === sem);
            const semGpa = gpaBySemester.find((g) => g.semester === `Sem ${sem}`)?.gpa || 0.0;

            return (
              <div key={sem} className="p-6 rounded-3xl glass-card space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
                  <h3 className="font-extrabold text-base text-slate-800 dark:text-white">
                    Semester {sem} Grades
                  </h3>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-500/10 text-primary-500">
                    GPA: {semGpa.toFixed(2)}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-200/50 dark:border-slate-800/50">
                        <th className="py-2.5">Subject</th>
                        <th className="py-2.5">Credits</th>
                        <th className="py-2.5">Marks Obtained</th>
                        <th className="py-2.5 text-right">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                      {semResults.map((r) => (
                        <tr key={r._id} className="text-slate-700 dark:text-slate-200">
                          <td className="py-3">
                            <p className="font-extrabold">{r.subject?.name}</p>
                            <span className="text-[10px] text-slate-400">{r.subject?.code}</span>
                          </td>
                          <td className="py-3">{r.subject?.credits || 3}</td>
                          <td className="py-3">{r.marksObtained} / {r.maxMarks}</td>
                          <td className="py-3 text-right font-extrabold text-primary-500">
                            {r.grade}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default StudentResults;
