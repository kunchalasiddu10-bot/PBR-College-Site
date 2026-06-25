import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  FileText,
  AlertTriangle,
  Clock,
  MapPin,
  PlusCircle
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Filler);

export const FacultyDashboard: React.FC = () => {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/faculty/dashboard');
        setDashboardData(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch Faculty dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-400">Loading Faculty workspace...</p>
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} className="max-w-2xl mx-auto" />;
  }

  const { stats, todayClasses, assignments } = dashboardData;

  const workloadChartData = {
    labels: assignments.map((a: any) => `${a.subject?.code} (${a.section?.name})`) || ['Class 1'],
    datasets: [
      {
        label: 'Subject Credits',
        data: assignments.map((a: any) => a.subject?.credits || 4) || [4],
        backgroundColor: 'rgba(56, 170, 248, 0.75)',
        borderColor: '#38aaf8',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Faculty Workspace
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Manage your course assignments, mark student attendance logs, and upload study resources.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Students</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.totalStudents}</p>
            <p className="text-[10px] font-semibold text-slate-400">In assigned sections</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Subjects Taught</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.assignedSubjects}</p>
            <p className="text-[10px] font-semibold text-slate-400">Active class allocations</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Grading Queue</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.pendingGradingCount}</p>
            <p className="text-[10px] font-semibold text-slate-400">Unscored submissions</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
            <FileText className="h-6 w-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Attendance Alerts</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.lowAttendanceCount}</p>
            <p className="text-[10px] font-semibold text-slate-400">Students with shortages</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="p-6 rounded-3xl glass-card space-y-4">
            <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Class Workload Credit Matrix</h3>
            <Bar data={workloadChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-400">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <Link to="/faculty/attendance" className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-750 transition text-center space-y-2 block">
                <Users className="h-5 w-5 mx-auto text-green-400" />
                <p className="text-[10px] font-bold">Mark attendance</p>
              </Link>
              <Link to="/faculty/assignments" className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-750 transition text-center space-y-2 block">
                <PlusCircle className="h-5 w-5 mx-auto text-primary-400" />
                <p className="text-[10px] font-bold">Create assignment</p>
              </Link>
              <Link to="/faculty/study-materials" className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-750 transition text-center space-y-2 block">
                <BookOpen className="h-5 w-5 mx-auto text-yellow-400" />
                <p className="text-[10px] font-bold">Upload resources</p>
              </Link>
              <Link to="/faculty/results" className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-750 transition text-center space-y-2 block">
                <FileText className="h-5 w-5 mx-auto text-purple-400" />
                <p className="text-[10px] font-bold">Post grades</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Schedule Column */}
        <div className="space-y-8">
          <div className="p-6 rounded-3xl glass-card space-y-6">
            <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Today's Class Schedule</h3>
            <div className="flex flex-col gap-4">
              {todayClasses.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-xs font-semibold text-slate-400">No classes scheduled for today.</p>
                </div>
              ) : (
                todayClasses.map((cls: any) => (
                  <div key={cls._id} className="flex gap-4 items-start pb-4 border-b border-slate-200/50 dark:border-slate-800/50 last:border-b-0 last:pb-0">
                    <div className="text-center shrink-0 w-16">
                      <span className="text-xs font-extrabold block text-slate-700 dark:text-slate-300">{cls.startTime}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">to {cls.endTime}</span>
                    </div>
                    <div className="h-6 w-[2px] bg-slate-300 dark:bg-slate-700 self-center shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-slate-800 dark:text-white">{cls.subject?.name}</p>
                      <div className="flex gap-2 text-[10px] font-bold text-slate-400">
                        <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {cls.room}</span>
                        <span>Sem {cls.semester} Sec {cls.section}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FacultyDashboard;
