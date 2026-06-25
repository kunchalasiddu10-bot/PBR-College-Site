import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  FileSpreadsheet,
  BookOpen,
  CalendarClock,
  Clock,
  MapPin,
  User,
  ArrowRight,
  PlusCircle,
  BellRing
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const StudentDashboard: React.FC = () => {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashRes, profileRes] = await Promise.all([
          api.get('/student/dashboard'),
          api.get('/student/profile'),
        ]);
        setData(dashRes.data.data);
        setProfile(profileRes.data.data.student);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data.');
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
        <p className="text-sm font-semibold text-slate-400">Loading student workspace...</p>
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} className="max-w-2xl mx-auto" />;
  }

  // 1. Chart Configuration: Subject Attendance Rates
  const attendanceChartData = {
    labels: ['OS (CS301)', 'DBMS (CS302)', 'Web Tech (CS303)', 'Networks (CS304)', 'FLAT (CS305)'],
    datasets: [
      {
        label: 'Attendance %',
        data: [85, 90, 78, 88, 75], // Fallback/realistic seed levels
        backgroundColor: 'rgba(14, 144, 233, 0.75)',
        borderColor: '#0e90e9',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const attendanceChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { min: 0, max: 100 },
    },
  };

  // 2. Chart Configuration: GPA Performance Trends
  const performanceChartData = {
    labels: ['Semester 1', 'Semester 2', 'Semester 3 (Current Goal)'],
    datasets: [
      {
        label: 'GPA',
        data: [8.4, 8.9, 8.7],
        borderColor: '#38aaf8',
        backgroundColor: 'rgba(56, 170, 248, 0.15)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#0e90e9',
        pointHoverRadius: 8,
      },
    ],
  };

  const performanceChartOptions = {
    responsive: true,
    scales: {
      y: { min: 0, max: 10 },
    },
  };

  return (
    <div className="space-y-8">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Hello, {profile?.user?.name.split(' ')[0]}!
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            {profile?.department?.name} | Semester {profile?.currentSemester} Section {profile?.section}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link to="/student/complaints">
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-350 hover:dark:bg-slate-700 transition-all">
              <PlusCircle className="h-4 w-4" /> File Complaint
            </button>
          </Link>
          <Link to="/student/timetable">
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-primary-500 hover:bg-primary-600 text-white shadow-md shadow-primary-500/25 transition-all">
              Check Schedule
            </button>
          </Link>
        </div>
      </div>

      {/* Grid of Key Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Attendance Widget */}
        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Attendance</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {data?.attendance?.percentage}%
            </p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
              {data?.attendance?.present}/{data?.attendance?.total} Classes Marked
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>

        {/* Assignments Widget */}
        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Assignments</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {data?.pendingAssignmentsCount}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Pending Submissions</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
        </div>

        {/* Library Loans Widget */}
        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Borrowed Books</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {data?.activeLibraryLoansCount}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Active Borrowed Copies</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        {/* Upcoming Exams Widget */}
        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Upcoming Exams</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {data?.upcomingExamsCount}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Exams Mapped Next</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <CalendarClock className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Main Charts & Classes Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Charts Column (Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Charts Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subject Attendance Bar Chart */}
            <div className="p-6 rounded-3xl glass-card space-y-4">
              <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Subject Attendance</h3>
              <Bar data={attendanceChartData} options={attendanceChartOptions} />
            </div>

            {/* GPA Performance Line Chart */}
            <div className="p-6 rounded-3xl glass-card space-y-4">
              <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Academic GPA Trend</h3>
              <Line data={performanceChartData} options={performanceChartOptions} />
            </div>
          </div>

          {/* Recent Campus Announcements */}
          <div className="p-6 rounded-3xl glass-card space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Recent Campus Notices</h3>
              <Link to="/student/notifications" className="text-xs font-bold text-primary-500 flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            
            <div className="flex flex-col gap-3">
              {data?.recentNotifications?.length === 0 ? (
                <p className="text-xs text-slate-400 font-semibold py-4">No recent notices found</p>
              ) : (
                data?.recentNotifications?.map((notif: any) => (
                  <div key={notif._id} className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-800/30 border flex gap-3 items-start">
                    <div className="p-2 rounded-xl bg-primary-500/10 text-primary-500 shrink-0">
                      <BellRing className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-extrabold text-slate-800 dark:text-white">{notif.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{notif.message}</p>
                      <span className="text-[9px] text-slate-400 font-semibold block mt-1.5">{new Date(notif.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Classes Column (Span 1) */}
        <div className="space-y-8">
          <div className="p-6 rounded-3xl glass-card space-y-6">
            <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wide">Today's Class Schedule</h3>
            
            <div className="flex flex-col gap-4">
              {data?.todayClasses?.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <div className="mx-auto h-10 w-10 bg-slate-100 dark:bg-slate-850 rounded-xl flex items-center justify-center text-slate-400">
                    <Clock className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-400">No classes scheduled today</p>
                </div>
              ) : (
                data?.todayClasses?.map((cls: any) => (
                  <div key={cls._id} className="flex gap-4 items-start pb-4 border-b border-slate-200/50 dark:border-slate-800/50 last:border-b-0 last:pb-0">
                    <div className="text-center shrink-0 w-16">
                      <span className="text-xs font-extrabold block text-slate-700 dark:text-slate-300">{cls.startTime}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">to {cls.endTime}</span>
                    </div>
                    
                    <div className="h-6 w-[2px] bg-slate-300 dark:bg-slate-700 self-center shrink-0" />

                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-slate-800 dark:text-white leading-tight">
                        {cls.subject?.name}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 shrink-0" /> {cls.room}</span>
                        <span className="flex items-center gap-1"><User className="h-3 w-3 shrink-0" /> {cls.teacherName.split(' ').slice(1).join(' ')}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats Summary Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-xl shadow-primary-500/25 space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-widest text-primary-200">Academic Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-primary-200 uppercase tracking-wider">Current CGPA</p>
                <p className="text-2xl font-extrabold mt-1">{profile?.cgpa?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-primary-200 uppercase tracking-wider">Credits Earned</p>
                <p className="text-2xl font-extrabold mt-1">{profile?.creditsCompleted}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
      
    </div>
  );
};

export default StudentDashboard;
