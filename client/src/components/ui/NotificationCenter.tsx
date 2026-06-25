import React, { useState, useEffect, useRef } from 'react';
import { Bell, Settings, CheckCheck, Trash2, ShieldAlert } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../services/api';

interface INotification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

interface IPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  disabledTypes: string[];
}

export const NotificationCenter: React.FC = () => {
  const { socket } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [prefs, setPrefs] = useState<IPreferences>({
    emailEnabled: true,
    pushEnabled: true,
    disabledTypes: [],
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch initial notifications and preferences
  const loadData = async () => {
    try {
      const resNotif = await api.get('/notifications');
      setNotifications(resNotif.data.data.notifications);
      setUnreadCount(resNotif.data.data.unreadCount);

      const resPrefs = await api.get('/notifications/preferences');
      setPrefs(resPrefs.data.data.preferences);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    loadData();

    // Request desktop notification permission on mount if supported
    if ('Notification' in window && window.Notification.permission === 'default') {
      window.Notification.requestPermission();
    }
  }, []);

  // Listen for socket notification events
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: INotification) => {
      // 1. Pre-check if notification type is disabled locally
      if (prefs.disabledTypes.includes(notification.type)) {
        return;
      }

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // 2. Play subtle sound if supported
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.4;
        audio.play().catch(() => {});
      } catch (err) {}

      // 3. Show native desktop notification if enabled
      if (
        prefs.pushEnabled &&
        'Notification' in window &&
        window.Notification.permission === 'granted'
      ) {
        new window.Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png', // Fallback icon path
        });
      }
    };

    socket.on('notification', handleNewNotification);

    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, [socket, prefs]);

  // Handle clicking outside of dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowPrefs(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      loadData(); // Refresh list on opening dropdown
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      const wasUnread = notifications.find((n) => n._id === id && !n.isRead);
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePreference = async (field: 'emailEnabled' | 'pushEnabled') => {
    const updated = { ...prefs, [field]: !prefs[field] };
    setPrefs(updated);
    try {
      await api.patch('/notifications/preferences', updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleMutedType = async (type: string) => {
    let disabledTypes = [...prefs.disabledTypes];
    if (disabledTypes.includes(type)) {
      disabledTypes = disabledTypes.filter((t) => t !== type);
    } else {
      disabledTypes.push(type);
    }

    const updated = { ...prefs, disabledTypes };
    setPrefs(updated);
    try {
      await api.patch('/notifications/preferences', updated);
    } catch (err) {
      console.error(err);
    }
  };

  const notificationTypes = [
    'Attendance',
    'Assignment',
    'Exam',
    'Result',
    'Placement',
    'Library',
    'Complaint',
    'Announcement',
    'Emergency',
    'System',
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button — Iron Man Style */}
      <button
        onClick={handleToggleOpen}
        className="p-2 rounded-lg bg-stark-surface border border-stark-border/60 hover:border-stark-red/50 text-stark-muted hover:text-stark-red transition-all relative group"
        aria-label="Toggle notifications menu"
      >
        <Bell className="h-4 w-4 group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-stark-red text-white text-[9px] font-hud font-bold flex items-center justify-center animate-red-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Container — Iron Man HUD Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] hud-panel z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 bg-stark-surface/50 border-b border-stark-border/60">
            <span className="font-hud text-xs tracking-widest text-stark-text flex items-center gap-2 uppercase">
              <div className="w-1.5 h-1.5 rounded-full bg-stark-red animate-arc-pulse" />
              JARVIS Alerts
              {unreadCount > 0 && (
                <span className="hud-badge-red">
                  {unreadCount}
                </span>
              )}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowPrefs(!showPrefs)}
                className={`p-1.5 rounded-lg transition-colors ${showPrefs ? 'text-stark-red' : 'text-stark-dim hover:text-stark-muted'}`}
                title="Alert Settings"
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
              {unreadCount > 0 && !showPrefs && (
                <button
                  onClick={handleMarkAllRead}
                  className="p-1.5 rounded-lg text-stark-dim hover:text-stark-cyan transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Preferences View — Iron Man */}
          {showPrefs ? (
            <div className="p-4 max-h-[28rem] overflow-y-auto flex flex-col gap-4 bg-stark-panel">
              <h4 className="font-hud text-[9px] uppercase tracking-widest text-stark-muted">Comm System Preferences</h4>
              
              <div className="flex items-center justify-between">
                <span className="font-display text-xs text-stark-muted">Email Alerts</span>
                <input type="checkbox" checked={prefs.emailEnabled}
                  onChange={() => handleTogglePreference('emailEnabled')}
                  className="w-4 h-4 accent-stark-red bg-stark-surface rounded border-stark-border" />
              </div>

              <div className="flex items-center justify-between">
                <span className="font-display text-xs text-stark-muted">Push / Desktop Alerts</span>
                <input type="checkbox" checked={prefs.pushEnabled}
                  onChange={() => handleTogglePreference('pushEnabled')}
                  className="w-4 h-4 accent-stark-red bg-stark-surface rounded border-stark-border" />
              </div>

              <div className="h-px bg-stark-border/50" />
              <h4 className="font-hud text-[9px] uppercase tracking-widest text-stark-muted">Alert Channels</h4>
              
              <div className="grid grid-cols-2 gap-1.5">
                {notificationTypes.map((type) => {
                  const isMuted = prefs.disabledTypes.includes(type);
                  return (
                    <button key={type} onClick={() => handleToggleMutedType(type)}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-hud tracking-wider border transition-all text-left flex items-center justify-between uppercase ${
                        isMuted
                          ? 'border-stark-border text-stark-dim bg-stark-surface/30'
                          : 'border-stark-red/30 text-stark-red bg-stark-red/5'
                      }`}>
                      {type}
                      {isMuted && <span className="text-[8px] text-stark-dim">OFF</span>}
                    </button>
                  );
                })}
              </div>

              <button onClick={() => setShowPrefs(false)}
                className="mt-2 stark-btn-primary text-[10px] w-full">
                Confirm Configuration
              </button>
            </div>
          ) : (
            /* Notifications Feed — Iron Man */
            <div className="max-h-[28rem] overflow-y-auto flex flex-col divide-y divide-stark-border/40 bg-stark-panel">
              {notifications.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <ShieldAlert className="h-10 w-10 text-stark-dim mb-3" />
                  <p className="font-hud text-xs text-stark-muted uppercase tracking-widest">No Alerts</p>
                  <p className="font-display text-[10px] text-stark-dim mt-1">JARVIS monitoring... all clear</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif._id}
                    onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                    className={`p-4 flex gap-3 hover:bg-stark-red/5 transition-all cursor-pointer relative group ${
                      notif.isRead ? '' : 'bg-stark-red/[0.03]'
                    }`}>
                    {!notif.isRead && (
                      <span className="absolute left-2 top-4 h-1.5 w-1.5 rounded-full bg-stark-red" style={{ boxShadow: '0 0 4px rgba(192,57,43,0.8)' }} />
                    )}
                    <div className="flex-1 min-w-0 pl-1">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-display text-xs font-semibold text-stark-text leading-tight">
                          {notif.title}
                        </span>
                        <span className="font-hud text-[8px] tracking-wider text-stark-dim whitespace-nowrap">
                          {new Date(notif.createdAt).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="font-display text-[11px] text-stark-muted mt-1 leading-snug">{notif.message}</p>
                      {notif.type && (
                        <span className="hud-badge-dim mt-2 inline-flex">{notif.type}</span>
                      )}
                    </div>
                    <div className="flex items-start opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => handleDelete(e, notif._id)}
                        className="p-1 rounded text-stark-dim hover:text-stark-red transition-colors"
                        title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
