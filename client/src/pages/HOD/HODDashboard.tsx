import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  AlertOctagon,
  TrendingUp,
  Award,
  Clock
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

export const HODDashboard: React.FC = () => {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/hod/dashboard');
        setDashboardData(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch HOD dashboard summary.');
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
        <p className="text-sm font-semibold text-slate-400">Loading HOD workspace...</p>
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} className="max-w-2xl mx-auto" />;
  }

  const { stats, department } = dashboardData;

  const chartData = {
    labels: ['Total Students', 'Faculty Members', 'Subjects Offered'],
    datasets: [
      {
        label: 'Count',
        data: [stats.studentCount, stats.facultyCount, stats.subjectsCount],
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
          {department?.name || 'Department'} Dashboard
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Monitor faculty workloads, class timetables, and student performance metrics.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Students</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.studentCount}</p>
            <p className="text-[10px] font-semibold text-slate-400">Registered in department</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center">
            <GraduationCap className="h-6 w-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Faculty Members</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.facultyCount}</p>
            <p className="text-[10px] font-semibold text-slate-400">Department lecturers</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Attendance</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.averageAttendance}%</p>
            <p className="text-[10px] font-semibold text-slate-400">Overall attendance ratio</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Unresolved Tickets</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.pendingComplaints}</p>
            <p className="text-[10px] font-semibold text-slate-400">Complaints in queue</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <AlertOctagon className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="p-6 rounded-3xl glass-card space-y-4">
            <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Department Resources Snapshot</h3>
            <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-450">Quick Portlets</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <Link to="/hod/faculty" className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-750 transition text-center space-y-2 block">
                <Users className="h-5 w-5 mx-auto text-green-400" />
                <p className="text-[10px] font-bold">Faculty workload</p>
              </Link>
              <Link to="/hod/attendance" className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-750 transition text-center space-y-2 block">
                <Clock className="h-5 w-5 mx-auto text-primary-400" />
                <p className="text-[10px] font-bold">Department attendance</p>
              </Link>
              <Link to="/hod/results" className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-750 transition text-center space-y-2 block">
                <Award className="h-5 w-5 mx-auto text-yellow-400" />
                <p className="text-[10px] font-bold">Academic results</p>
              </Link>
              <Link to="/hod/complaints" className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-750 transition text-center space-y-2 block">
                <AlertOctagon className="h-5 w-5 mx-auto text-red-400" />
                <p className="text-[10px] font-bold">Resolve tickets</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Info Column */}
        <div className="space-y-8">
          <div className="p-6 rounded-3xl glass-card space-y-6">
            <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Department Info Card</h3>
            <div className="space-y-4 text-xs font-bold text-slate-500">
              <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-800/30 border space-y-2">
                <p className="text-slate-400 uppercase text-[10px]">Academic Head Details</p>
                <p><span className="text-primary-500">Department Name:</span> {department?.name}</p>
                <p><span className="text-primary-500">Code Designation:</span> {department?.code}</p>
                <p><span className="text-primary-500">Synopsis:</span> {department?.description}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HODDashboard;
