import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Bookmark,
  Calendar,
  CalendarDays,
  Columns,
  Clock,
  ClipboardCheck,
  FileText,
  Award,
  FileSpreadsheet,
  Book,
  CalendarDays as CalendarRange,
  Briefcase,
  AlertOctagon,
  Megaphone,
  BarChart3,
  TrendingUp,
  Settings,
  History,
  User,
  LogOut,
  Menu,
  X,
  Search,
  ChevronDown,
  Sparkles,
  MessageSquare,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/ui/Logo';
import NotificationCenter from '../components/ui/NotificationCenter';
import IronManBackground from '../components/ui/IronManBackground';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location]);

  const menuGroups = [
    {
      title: 'Core Control',
      color: 'gold',
      items: [
        { name: 'Dashboard',    path: '/admin',               icon: <LayoutDashboard className="h-4 w-4" /> },
        { name: 'Profile Card', path: '/admin/profile',       icon: <User className="h-4 w-4" /> },
        { name: 'Announcements',path: '/admin/announcements', icon: <Megaphone className="h-4 w-4" /> },
        { name: 'Chat Space',   path: '/admin/chats',         icon: <MessageSquare className="h-4 w-4" /> },
        { name: 'Audit Logs',   path: '/admin/audit-logs',    icon: <History className="h-4 w-4" /> },
        { name: 'AI Assistant', path: '/admin/ai-assistant',  icon: <Sparkles className="h-4 w-4" /> },
      ],
    },
    {
      title: 'Human Resources',
      color: 'red',
      items: [
        { name: 'Students',    path: '/admin/students',    icon: <Users className="h-4 w-4" /> },
        { name: 'Faculty',     path: '/admin/faculty',     icon: <GraduationCap className="h-4 w-4" /> },
        { name: 'Departments', path: '/admin/departments', icon: <Building2 className="h-4 w-4" /> },
      ],
    },
    {
      title: 'Academics',
      color: 'cyan',
      items: [
        { name: 'Courses',       path: '/admin/courses',       icon: <BookOpen className="h-4 w-4" /> },
        { name: 'Subjects',      path: '/admin/subjects',      icon: <Bookmark className="h-4 w-4" /> },
        { name: 'Academic Years',path: '/admin/academic-years',icon: <Calendar className="h-4 w-4" /> },
        { name: 'Semesters',     path: '/admin/semesters',     icon: <CalendarDays className="h-4 w-4" /> },
        { name: 'Sections',      path: '/admin/sections',      icon: <Columns className="h-4 w-4" /> },
      ],
    },
    {
      title: 'Operations',
      color: 'red',
      items: [
        { name: 'Timetables',  path: '/admin/timetables',  icon: <Clock className="h-4 w-4" /> },
        { name: 'Attendance',  path: '/admin/attendance',  icon: <ClipboardCheck className="h-4 w-4" /> },
        { name: 'Assignments', path: '/admin/assignments', icon: <FileText className="h-4 w-4" /> },
        { name: 'Exams',       path: '/admin/exams',       icon: <FileSpreadsheet className="h-4 w-4" /> },
        { name: 'Results',     path: '/admin/results',     icon: <Award className="h-4 w-4" /> },
        { name: 'Library',     path: '/admin/library',     icon: <Book className="h-4 w-4" /> },
        { name: 'Events',      path: '/admin/events',      icon: <CalendarRange className="h-4 w-4" /> },
        { name: 'Placements',  path: '/admin/placements',  icon: <Briefcase className="h-4 w-4" /> },
        { name: 'Complaints',  path: '/admin/complaints',  icon: <AlertOctagon className="h-4 w-4" /> },
      ],
    },
    {
      title: 'Analytics',
      color: 'gold',
      items: [
        { name: 'Reports',   path: '/admin/reports',   icon: <BarChart3 className="h-4 w-4" /> },
        { name: 'Analytics', path: '/admin/analytics', icon: <TrendingUp className="h-4 w-4" /> },
        { name: 'Settings',  path: '/admin/settings',  icon: <Settings className="h-4 w-4" /> },
      ],
    },
  ];

  const groupAccentColors: Record<string, string> = {
    gold: 'text-stark-gold',
    red:  'text-stark-red',
    cyan: 'text-stark-cyan',
  };

  const SidebarContent = () => (
    <>
      {/* Logo + Admin badge */}
      <div className="p-5 border-b border-stark-border/50 relative">
        <Logo size="sm" />
        <div className="flex items-center gap-1.5 mt-2">
          <Shield className="h-3 w-3 text-stark-gold" />
          <span className="font-hud text-[9px] tracking-[0.3em] text-stark-gold uppercase">
            Admin · Stark Level Access
          </span>
        </div>
        <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-stark-gold/50 to-transparent" />
      </div>

      {/* Admin identity */}
      <div className="px-4 py-3 mx-3 mt-3 rounded-lg bg-stark-surface border border-stark-gold/20 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-stark-gold/10 border border-stark-gold/30 flex items-center justify-center text-xs font-hud font-bold text-stark-gold uppercase flex-shrink-0"
          style={{ boxShadow: '0 0 10px rgba(212,160,23,0.2)' }}>
          {user?.profileImage ? (
            <img src={user.profileImage} alt="Admin" className="h-full w-full object-cover rounded-lg" />
          ) : (
            user?.name?.[0] ?? 'A'
          )}
        </div>
        <div className="min-w-0">
          <p className="font-display text-xs font-semibold text-stark-text truncate">{user?.name}</p>
          <p className="font-hud text-[9px] tracking-widest text-stark-gold uppercase">ADMINISTRATOR</p>
        </div>
        <div className="ml-auto h-2 w-2 rounded-full bg-stark-gold animate-arc-pulse flex-shrink-0"
          style={{ boxShadow: '0 0 6px rgba(212,160,23,0.8)' }} />
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-4 overflow-y-auto">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <p className={`font-hud text-[9px] tracking-widest uppercase px-4 mb-1.5 ${groupAccentColors[group.color]}`}>
              {group.title}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) =>
                    isActive
                      ? 'nav-item-active [border-left-color:rgb(212,160,23)] [background:rgba(212,160,23,0.1)]'
                      : 'nav-item'
                  }
                >
                  <span className="text-stark-gold">{item.icon}</span>
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-stark-border/50">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-display font-medium tracking-wider uppercase text-stark-muted hover:text-stark-red-bright hover:bg-stark-red/10 transition-all">
          <LogOut className="h-4 w-4" />
          Logout Session
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex text-stark-text relative" style={{ background: '#050508' }}>
      <IronManBackground />

      {/* Desktop Sidebar — Gold accent for Admin */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 relative z-10" style={{ background: 'rgba(5,5,10,0.92)', borderRight: '1px solid rgba(212,160,23,0.3)' }}>
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-stark-gold/40 to-transparent" />
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top HUD Bar */}
        <header className="h-14 flex items-center justify-between px-4 sm:px-6 z-20 shrink-0 relative" style={{ background: 'rgba(5,5,10,0.92)', borderBottom: '1px solid rgba(212,160,23,0.2)' }}>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-stark-gold/30 to-transparent" />

          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-stark-muted hover:text-stark-text hover:bg-stark-surface transition-colors">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-stark-surface border border-stark-border/60 w-56 focus-within:border-stark-gold/50 transition-colors">
              <Search className="h-3.5 w-3.5 text-stark-dim shrink-0" />
              <input type="text" placeholder="Search admin data..."
                className="bg-transparent border-none text-xs focus:outline-none w-full text-stark-text placeholder-stark-dim font-display" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stark-surface border border-stark-gold/20">
              <div className="w-1.5 h-1.5 rounded-full bg-stark-gold animate-arc-pulse" />
              <span className="font-hud text-[9px] tracking-widest text-stark-gold uppercase">Admin Mode</span>
            </div>

            <NotificationCenter />

            <div className="relative">
              <button onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-stark-surface border border-stark-gold/20 hover:border-stark-gold/50 transition-colors">
                <div className="h-6 w-6 rounded-md bg-stark-gold/10 border border-stark-gold/30 flex items-center justify-center text-[10px] font-hud font-bold text-stark-gold uppercase">
                  {user?.name?.[0] ?? 'A'}
                </div>
                <span className="hidden sm:inline font-hud text-[10px] tracking-wider text-stark-muted">Admin</span>
                <ChevronDown className="h-3 w-3 text-stark-dim" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 hud-panel p-2 z-50 animate-fade-in flex flex-col gap-1">
                  <div className="px-3 py-2 border-b border-stark-border/50 mb-1">
                    <p className="font-display text-xs font-semibold text-stark-text truncate">{user?.name}</p>
                    <p className="font-hud text-[9px] tracking-widest text-stark-gold uppercase">Administrator</p>
                  </div>
                  <NavLink to="/admin/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-display text-stark-muted hover:text-stark-text hover:bg-stark-surface transition-colors">
                    <User className="h-3.5 w-3.5" /> Admin Profile
                  </NavLink>
                  <NavLink to="/admin/settings"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-display text-stark-muted hover:text-stark-text hover:bg-stark-surface transition-colors">
                    <Settings className="h-3.5 w-3.5" /> System Settings
                  </NavLink>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-display text-stark-red hover:bg-stark-red/10 text-left transition-colors">
                    <LogOut className="h-3.5 w-3.5" /> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-fade-in">
          <div onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-stark-bg/80 backdrop-blur-sm" />
          <div className="relative w-64 bg-stark-panel border-r border-stark-gold/20 flex flex-col h-full z-10">
            <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-stark-gold/40 to-transparent" />
            <div className="flex justify-between items-center p-4 border-b border-stark-border/50">
              <Logo size="sm" />
              <button onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-stark-muted hover:text-stark-text hover:bg-stark-surface">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
