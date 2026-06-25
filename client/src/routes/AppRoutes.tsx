import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import Unauthorized from '../pages/Unauthorized';
import NotFound from '../pages/NotFound';
import LoadingScreen from '../pages/LoadingScreen';
import Button from '../components/ui/Button';

// Student Portal Layout & Page Imports
import DashboardLayout from '../layouts/DashboardLayout';
import StudentDashboard from '../pages/Student/StudentDashboard';
import StudentAttendance from '../pages/Student/StudentAttendance';
import StudentTimetable from '../pages/Student/StudentTimetable';
import StudentAssignments from '../pages/Student/StudentAssignments';
import StudentResults from '../pages/Student/StudentResults';
import StudentExams from '../pages/Student/StudentExams';
import StudentLibrary from '../pages/Student/StudentLibrary';
import StudentComplaints from '../pages/Student/StudentComplaints';
import StudentProfile from '../pages/Student/StudentProfile';
import StudentSettings from '../pages/Student/StudentSettings';

// Admin Portal Layout & Page Imports
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import StudentsManagement from '../pages/Admin/StudentsManagement';
import FacultyManagement from '../pages/Admin/FacultyManagement';
import DepartmentManagement from '../pages/Admin/DepartmentManagement';
import CourseSubjectMgmt from '../pages/Admin/CourseSubjectMgmt';
import AcademicManagement from '../pages/Admin/AcademicManagement';
import LibraryManagement from '../pages/Admin/LibraryManagement';
import PlacementManagement from '../pages/Admin/PlacementManagement';
import EventManagement from '../pages/Admin/EventManagement';
import ComplaintManagement from '../pages/Admin/ComplaintManagement';
import AnalyticsDashboard from '../pages/Admin/AnalyticsDashboard';
import SystemSettings from '../pages/Admin/SystemSettings';
import AuditLogs from '../pages/Admin/AuditLogs';
import AnnouncementsFeed from '../pages/AnnouncementsFeed';
import ChatModule from '../pages/ChatModule';
import Reports from '../pages/Admin/Reports';
import Profile from '../pages/Admin/Profile';
import Timetables from '../pages/Admin/Timetables';
import Attendance from '../pages/Admin/Attendance';
import Assignments from '../pages/Admin/Assignments';
import Exams from '../pages/Admin/Exams';
import Results from '../pages/Admin/Results';
import AIAssistant from '../pages/AIAssistant';

// Faculty Page Imports
import FacultyLayout from '../layouts/FacultyLayout';
import FacultyDashboard from '../pages/Faculty/FacultyDashboard';
import FacultyAttendance from '../pages/Faculty/FacultyAttendance';
import FacultyAssignments from '../pages/Faculty/FacultyAssignments';
import FacultyStudyMaterials from '../pages/Faculty/FacultyStudyMaterials';
import FacultyResults from '../pages/Faculty/FacultyResults';
import FacultyStudents from '../pages/Faculty/FacultyStudents';
import FacultyTimetable from '../pages/Faculty/FacultyTimetable';

// HOD Page Imports
import HODLayout from '../layouts/HODLayout';
import HODDashboard from '../pages/HOD/HODDashboard';
import HODFaculty from '../pages/HOD/HODFaculty';
import HODAttendance from '../pages/HOD/HODAttendance';
import HODResults from '../pages/HOD/HODResults';
import HODTimetable from '../pages/HOD/HODTimetable';
import HODComplaints from '../pages/HOD/HODComplaints';


// 1. Mock Dashboard Wrapper for Testing Session Flows
const MockDashboard: React.FC<{ role: string }> = ({ role }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <div className="w-full max-w-2xl p-8 rounded-3xl glass-card text-center space-y-6">
        <div className="h-14 w-14 rounded-2xl bg-primary-100 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 mx-auto flex items-center justify-center font-bold text-xl shadow-lg shadow-primary-500/10">
          {role[0]}
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {role} Workspace
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Welcome back, <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name}</span> ({user?.email})
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border text-left text-xs font-mono space-y-2">
          <p className="font-semibold text-slate-500 dark:text-slate-400">SESSION AUDIT DETAILS:</p>
          <p><span className="text-primary-500 font-semibold">User ID:</span> {user?.id}</p>
          <p><span className="text-primary-500 font-semibold">Verified Status:</span> {user?.emailVerified ? 'true' : 'false'}</p>
          <p><span className="text-primary-500 font-semibold">Department:</span> {user?.department || 'N/A'}</p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate('/login')}>
            Verify Access Routes
          </Button>
          <Button variant="danger" onClick={logout}>
            Log Out Session
          </Button>
        </div>
      </div>
    </div>
  );
};

// 2. Redirect Handler: Determines landing pages depending on roles
const RedirectHandler: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Resolving user authorization parameters..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect tables matching roles
  const redirectPaths = {
    Admin: '/admin',
    HOD: '/hod',
    Faculty: '/faculty',
    Student: '/student',
    Visitor: '/visitor',
  };

  return <Navigate to={redirectPaths[user.role] || '/visitor'} replace />;
};

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Root redirect rules */}
      <Route
        path="/"
        element={
          isAuthenticated ? <RedirectHandler /> : <Navigate to="/login" replace />
        }
      />

      {/* Redirect dispatcher path */}
      <Route path="/redirect-handler" element={<RedirectHandler />} />

      {/* Public Authentication routes (inside split-pane layout) */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            isAuthenticated ? <RedirectHandler /> : <Login />
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      {/* Role Protected paths (mapped with route guards) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<StudentsManagement />} />
        <Route path="faculty" element={<FacultyManagement />} />
        <Route path="departments" element={<DepartmentManagement />} />
        <Route path="courses" element={<CourseSubjectMgmt />} />
        <Route path="subjects" element={<CourseSubjectMgmt />} />
        <Route path="academic-years" element={<AcademicManagement />} />
        <Route path="semesters" element={<AcademicManagement />} />
        <Route path="sections" element={<AcademicManagement />} />
        <Route path="timetables" element={<Timetables />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="exams" element={<Exams />} />
        <Route path="results" element={<Results />} />
        <Route path="library" element={<LibraryManagement />} />
        <Route path="events" element={<EventManagement />} />
        <Route path="placements" element={<PlacementManagement />} />
        <Route path="complaints" element={<ComplaintManagement />} />
        <Route path="announcements" element={<AnnouncementsFeed />} />
        <Route path="chats" element={<ChatModule />} />
        <Route path="reports" element={<Reports />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="profile" element={<Profile />} />
        <Route path="ai-assistant" element={<AIAssistant />} />
      </Route>
      <Route
        path="/hod"
        element={
          <ProtectedRoute allowedRoles={['HOD', 'Admin']}>
            <HODLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HODDashboard />} />
        <Route path="faculty" element={<HODFaculty />} />
        <Route path="attendance" element={<HODAttendance />} />
        <Route path="results" element={<HODResults />} />
        <Route path="timetable" element={<HODTimetable />} />
        <Route path="complaints" element={<HODComplaints />} />
        <Route path="ai-assistant" element={<AIAssistant />} />
        <Route path="announcements" element={<AnnouncementsFeed />} />
        <Route path="chats" element={<ChatModule />} />
      </Route>
      <Route
        path="/faculty"
        element={
          <ProtectedRoute allowedRoles={['Faculty', 'HOD', 'Admin']}>
            <FacultyLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<FacultyDashboard />} />
        <Route path="attendance" element={<FacultyAttendance />} />
        <Route path="assignments" element={<FacultyAssignments />} />
        <Route path="study-materials" element={<FacultyStudyMaterials />} />
        <Route path="results" element={<FacultyResults />} />
        <Route path="students" element={<FacultyStudents />} />
        <Route path="timetable" element={<FacultyTimetable />} />
        <Route path="ai-assistant" element={<AIAssistant />} />
        <Route path="announcements" element={<AnnouncementsFeed />} />
        <Route path="chats" element={<ChatModule />} />
      </Route>
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['Student', 'Admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="timetable" element={<StudentTimetable />} />
        <Route path="assignments" element={<StudentAssignments />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="exams" element={<StudentExams />} />
        <Route path="library" element={<StudentLibrary />} />
        <Route path="complaints" element={<StudentComplaints />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="settings" element={<StudentSettings />} />
        <Route path="ai-assistant" element={<AIAssistant />} />
        <Route path="announcements" element={<AnnouncementsFeed />} />
        <Route path="chats" element={<ChatModule />} />
      </Route>
      <Route
        path="/visitor"
        element={
          <ProtectedRoute allowedRoles={['Visitor', 'Student', 'Faculty', 'HOD', 'Admin']}>
            <MockDashboard role="Visitor" />
          </ProtectedRoute>
        }
      />

      {/* 404 Fallback routing */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
