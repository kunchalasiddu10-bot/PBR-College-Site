import React, { useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';

export const Results: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/results');
        setResults(res.data.data.results);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch transcripts.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const filtered = results.filter((r) =>
    r.student?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.subject?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && results.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-400">Loading grade results transcripts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Grading & Results
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Review overall student transcripts, letter grades, and subject-wise averages.
        </p>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Filter search */}
      <div className="max-w-md">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by student roll, subject name, or code..."
          className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
        />
      </div>

      {/* List Table */}
      <div className="p-6 rounded-3xl glass-card space-y-4">
        <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Recorded Student Grades</h3>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Award className="h-10 w-10 mx-auto text-slate-400 mb-2" />
            <p className="text-xs font-semibold text-slate-400">No grades or transcript entries match.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                  <th className="pb-3 pl-2">Student Roll</th>
                  <th className="pb-3">Subject / Code</th>
                  <th className="pb-3">Exam Category</th>
                  <th className="pb-3 text-center">Marks Obtained</th>
                  <th className="pb-3 text-right pr-4">Letter Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filtered.map((r) => (
                  <tr key={r._id} className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    <td className="py-4 pl-2 font-mono text-primary-500">{r.student?.rollNumber || 'N/A'}</td>
                    <td className="py-4">
                      <p>{r.subject?.name}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{r.subject?.code}</span>
                    </td>
                    <td className="py-4">{r.examType}</td>
                    <td className="py-4 text-center">{r.marksObtained} / {r.maxMarks}</td>
                    <td className="py-4 text-right pr-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase ${
                        r.grade === 'O' || r.grade === 'A'
                          ? 'bg-green-500/10 text-green-600'
                          : r.grade === 'F'
                          ? 'bg-red-500/10 text-red-650'
                          : 'bg-yellow-500/10 text-slate-900 dark:text-slate-200'
                      }`}>
                        {r.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
