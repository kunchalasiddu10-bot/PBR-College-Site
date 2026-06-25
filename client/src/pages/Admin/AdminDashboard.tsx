import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Briefcase,
  AlertOctagon,
  Clock,
  History,
  HeartPulse,
  TrendingUp,
  Award,
  BellRing,
  Settings
} from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';

export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        setData(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch administrator dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-400">Loading enterprise control center...</p>
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} className="max-w-2xl mx-auto" />;
  }

  const stats = data?.stats;

  // Chart configs
  const enrollmentChartData = {
    labels: ['CSE', 'ECE', 'ME', 'CE', 'EEE'],
    datasets: [
      {
        label: 'Students Enrolled',
        data: [180, 120, 75, 45, 60],
        backgroundColor: 'rgba(14, 144, 233, 0.75)',
        borderColor: '#0e90e9',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const performanceChartData = {
    labels: ['Unit 1', 'Mid-Term', 'Unit 2', 'Semester End'],
    datasets: [
      {
        label: 'Average GPA',
        data: [7.2, 7.8, 8.1, 8.4],
        borderColor: '#38aaf8',
        backgroundColor: 'rgba(56, 170, 248, 0.15)',
        fill: true,
        tension: 0.4,
      },
    ],
  };


  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Institution Control Center</h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Real-time diagnostics, student rosters, academic calendars, and analytics.
        </p>
      </div>

      {/* Stats Grids */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Students</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats?.totalStudents}</p>
            <p className="text-[10px] font-semibold text-green-500 flex items-center gap-0.5"><TrendingUp className="h-3 w-3" /> +4.2% from last term</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Faculty</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats?.totalFaculty}</p>
            <p className="text-[10px] font-semibold text-slate-400">Instructors & Staff</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <GraduationCap className="h-6 w-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Departments</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats?.totalDepartments}</p>
            <p className="text-[10px] font-semibold text-slate-400">Academic Divisions</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Building2 className="h-6 w-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Courses</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats?.totalCourses}</p>
            <p className="text-[10px] font-semibold text-slate-400">{stats?.activeSemesters} Active Semesters</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Placement, Library & Complaints Mini-Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Placements</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">
              {stats?.placements?.selected} Hired
            </p>
            <p className="text-[10px] font-semibold text-slate-400">{stats?.placements?.drives} Hiring Drives</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
            <Briefcase className="h-6 w-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Library Loans</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">
              {stats?.library?.activeLoans} Issued
            </p>
            <p className="text-[10px] font-semibold text-slate-400">{stats?.library?.books} Books Cataloged</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
            <Award className="h-6 w-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Complaints</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">
              {stats?.complaints?.pending} Tickets
            </p>
            <p className="text-[10px] font-semibold text-green-500">{stats?.complaints?.resolved} Resolved Tickets</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <AlertOctagon className="h-6 w-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-primary-200">System Mode</p>
            <p className="text-xl font-extrabold">Active ERP</p>
            <p className="text-[10px] font-semibold text-primary-200">24/7 Automation On</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-white/10 text-white flex items-center justify-center">
            <HeartPulse className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Charts & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Charts Row */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl glass-card space-y-4">
              <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Enrollment by Dept</h3>
              <Bar data={enrollmentChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>

            <div className="p-6 rounded-3xl glass-card space-y-4">
              <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Academic GPA performance</h3>
              <Line data={performanceChartData} options={{ responsive: true }} />
            </div>
          </div>

          {/* Quick Action Hub */}
          <div className="p-6 rounded-3xl glass-card space-y-4">
            <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Quick Action Hub</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link to="/admin/students" className="p-4 rounded-2xl border text-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Users className="h-5 w-5 mx-auto mb-2 text-primary-500" />
                <span className="text-xs font-bold">Add Student</span>
              </Link>
              <Link to="/admin/faculty" className="p-4 rounded-2xl border text-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <GraduationCap className="h-5 w-5 mx-auto mb-2 text-purple-500" />
                <span className="text-xs font-bold">Add Faculty</span>
              </Link>
              <Link to="/admin/announcements" className="p-4 rounded-2xl border text-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <BellRing className="h-5 w-5 mx-auto mb-2 text-orange-500" />
                <span className="text-xs font-bold">Send Alert</span>
              </Link>
              <Link to="/admin/settings" className="p-4 rounded-2xl border text-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Settings className="h-5 w-5 mx-auto mb-2 text-slate-500" />
                <span className="text-xs font-bold">ERP Settings</span>
              </Link>
            </div>
          </div>
        </div>

        {/* System Activity & Diagnoses */}
        <div className="space-y-8">
          
          {/* Recent Audits */}
          <div className="p-6 rounded-3xl glass-card space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Security Audits</h3>
              <Link to="/admin/audit-logs" className="text-xs font-bold text-primary-500">View All</Link>
            </div>

            <div className="flex flex-col gap-4">
              {data?.recentActivity?.length === 0 ? (
                <p className="text-xs text-slate-400 font-semibold py-4 text-center">No recent administrative audits</p>
              ) : (
                data?.recentActivity?.map((act: any) => (
                  <div key={act._id} className="flex gap-3 items-start border-b last:border-b-0 pb-3 last:pb-0">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                      <History className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-extrabold text-slate-850 dark:text-white leading-tight">{act.action}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[180px]">{act.details}</p>
                      <span className="text-[9px] text-slate-400 block">{new Date(act.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* System Health */}
          <div className="p-6 rounded-3xl glass-card space-y-4">
            <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Server Diagnostics</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="font-bold text-slate-400">Node Server Engine</span>
                <span className="font-mono font-bold">{data?.systemHealth?.nodeVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-400">Heap Allocation</span>
                <span className="font-mono font-bold">{data?.systemHealth?.memory}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-400">Server Uptime</span>
                <span className="font-mono font-bold flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {data?.systemHealth?.uptime}s</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-400">DB Host Connections</span>
                <span className="font-mono font-bold text-green-500">127.0.0.1 (OK)</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
