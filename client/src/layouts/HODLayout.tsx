import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  GraduationCap,
  AlertOctagon,
  LogOut,
  Menu,
  X,
  Search,
  ChevronDown,
  UserCheck,
  Sparkles,
  Megaphone,
  MessageSquare,
  Users,
  User,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/ui/Logo';
import NotificationCenter from '../components/ui/NotificationCenter';
import IronManBackground from '../components/ui/IronManBackground';

export const HODLayout: React.FC = () => {
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

  const navItems = [
    { name: 'Dashboard',       path: '/hod',              icon: <LayoutDashboard className="h-4 w-4" /> },
    { name: 'Faculty Workload',path: '/hod/faculty',      icon: <Users className="h-4 w-4" /> },
    { name: 'Dept Attendance', path: '/hod/attendance',   icon: <UserCheck className="h-4 w-4" /> },
    { name: 'Dept Results',    path: '/hod/results',      icon: <GraduationCap className="h-4 w-4" /> },
    { name: 'Dept Timetable',  path: '/hod/timetable',    icon: <CalendarDays className="h-4 w-4" /> },
    { name: 'Complaints',      path: '/hod/complaints',   icon: <AlertOctagon className="h-4 w-4" /> },
    { name: 'Announcements',   path: '/hod/announcements',icon: <Megaphone className="h-4 w-4" /> },
    { name: 'Chat Space',      path: '/hod/chats',        icon: <MessageSquare className="h-4 w-4" /> },
    { name: 'AI Assistant',    path: '/hod/ai-assistant', icon: <Sparkles className="h-4 w-4" /> },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-stark-border/50 relative">
        <Logo size="sm" />
        <span className="font-hud text-[9px] tracking-[0.3em] text-stark-gold uppercase block mt-1">
          HOD Command
        </span>
        <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-stark-gold/50 to-transparent" />
      </div>

      {/* HOD identity — Gold + Red mix */}
      <div className="px-4 py-3 mx-3 mt-3 rounded-lg bg-stark-surface border border-stark-gold/20 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-stark-red/20 to-stark-gold/20 border border-stark-gold/30 flex items-center justify-center text-xs font-hud font-bold text-stark-gold uppercase flex-shrink-0"
          style={{ boxShadow: '0 0 10px rgba(212,160,23,0.2)' }}>
          {user?.profileImage ? (
            <img src={user.profileImage} alt="HOD" className="h-full w-full object-cover rounded-lg" />
          ) : (
            user?.name?.[0] ?? 'H'
          )}
        </div>
        <div className="min-w-0">
          <p className="font-display text-xs font-semibold text-stark-text truncate">{user?.name}</p>
          <p className="font-hud text-[9px] tracking-widest text-stark-gold uppercase">HEAD OF DEPT</p>
        </div>
        <div className="ml-auto h-2 w-2 rounded-full bg-stark-gold animate-arc-pulse flex-shrink-0"
          style={{ boxShadow: '0 0 6px rgba(212,160,23,0.8)' }} />
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        <div className="font-hud text-[9px] tracking-widest text-stark-dim uppercase px-4 mb-2">
          Command Matrix
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/hod'}
            className={({ isActive }) =>
              isActive
                ? 'nav-item text-stark-text bg-stark-gold/10 border-l-2 border-stark-gold'
                : 'nav-item'
            }
          >
            <span className="text-stark-gold">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-stark-border/50">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-display font-medium tracking-wider uppercase text-stark-muted hover:text-stark-red-bright hover:bg-stark-red/10 transition-all">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex text-stark-text relative" style={{ background: '#050508' }}>
      <IronManBackground />
      {/* Desktop Sidebar — Gold accent for HOD */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 relative z-10" style={{ background: 'rgba(5,5,10,0.92)', borderRight: '1px solid rgba(212,160,23,0.3)' }}>
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-stark-gold/30 to-transparent" />
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="h-14 flex items-center justify-between px-4 sm:px-6 z-20 shrink-0 relative" style={{ background: 'rgba(5,5,10,0.92)', borderBottom: '1px solid rgba(212,160,23,0.2)' }}>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-stark-gold/30 to-transparent" />

          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-stark-muted hover:text-stark-text hover:bg-stark-surface transition-colors">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-stark-surface border border-stark-border/60 w-56 focus-within:border-stark-gold/50 transition-colors">
              <Search className="h-3.5 w-3.5 text-stark-dim shrink-0" />
              <input type="text" placeholder="Search department data..."
                className="bg-transparent border-none text-xs focus:outline-none w-full text-stark-text placeholder-stark-dim font-display" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stark-surface border border-stark-gold/20">
              <div className="w-1.5 h-1.5 rounded-full bg-stark-gold animate-arc-pulse" />
              <span className="font-hud text-[9px] tracking-widest text-stark-gold uppercase">HOD Command</span>
            </div>

            <NotificationCenter />

            <div className="relative">
              <button onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-stark-surface border border-stark-gold/20 hover:border-stark-gold/50 transition-colors">
                <div className="h-6 w-6 rounded-md bg-stark-gold/10 border border-stark-gold/30 flex items-center justify-center text-[10px] font-hud font-bold text-stark-gold uppercase">
                  {user?.name?.[0] ?? 'H'}
                </div>
                <span className="hidden sm:inline font-hud text-[10px] tracking-wider text-stark-muted">
                  {user?.name?.split(' ')[0]}
                </span>
                <ChevronDown className="h-3 w-3 text-stark-dim" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 hud-panel p-2 z-50 animate-fade-in flex flex-col gap-1">
                  <div className="px-3 py-2 border-b border-stark-border/50 mb-1">
                    <p className="font-display text-xs font-semibold text-stark-text truncate">{user?.name}</p>
                    <p className="font-hud text-[9px] tracking-widest text-stark-gold uppercase">Head of Dept</p>
                  </div>
                  <NavLink to="/hod/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-display text-stark-muted hover:text-stark-text hover:bg-stark-surface transition-colors">
                    <User className="h-3.5 w-3.5" /> Profile
                  </NavLink>
                  <NavLink to="/hod/settings"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-display text-stark-muted hover:text-stark-text hover:bg-stark-surface transition-colors">
                    <Settings className="h-3.5 w-3.5" /> Settings
                  </NavLink>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-display text-stark-red hover:bg-stark-red/10 text-left transition-colors">
                    <LogOut className="h-3.5 w-3.5" /> Logout
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

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-fade-in">
          <div onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-stark-bg/80 backdrop-blur-sm" />
          <div className="relative w-64 bg-stark-panel border-r border-stark-gold/20 flex flex-col h-full z-10">
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

export default HODLayout;
