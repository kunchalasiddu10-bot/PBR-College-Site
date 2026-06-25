import React, { useState, useEffect } from 'react';
import { Megaphone, Pin, Plus, X, Paperclip, Clock, ShieldAlert, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { api } from '../services/api';

interface IUser {
  _id: string;
  name: string;
  role: string;
  profileImage?: string;
}

interface IAnnouncement {
  _id: string;
  title: string;
  content: string;
  author: IUser;
  attachments: string[];
  scheduledFor: string;
  targetAudience: {
    department?: string | null;
    semester?: number | null;
    section?: string | null;
  };
  isPinned: boolean;
  isRead: boolean;
  createdAt: string;
}

export const AnnouncementsFeed: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  // Announcement creator state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [scheduledFor, setScheduledFor] = useState('');
  
  // Target Audience state
  const [targetDept, setTargetDept] = useState('');
  const [targetSem, setTargetSem] = useState('');
  const [targetSec, setTargetSec] = useState('');
  
  // Attachments URL list
  const [attachmentsList, setAttachmentsList] = useState<string[]>([]);
  const [attachmentUrlInput, setAttachmentUrlInput] = useState('');

  // Fetch announcements feed
  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data.data.announcements);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  // Listen to live socket events for new/updated announcements
  useEffect(() => {
    if (!socket) return;

    const handleNewAnnouncement = (data: { announcement: IAnnouncement }) => {
      const newAnn = { ...data.announcement, isRead: false };
      
      // Prepend or insert in order of isPinned, createdAt
      setAnnouncements((prev) => {
        if (prev.some((a) => a._id === newAnn._id)) return prev;
        const updated = [newAnn, ...prev];
        return updated.sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      });

      // Play audio notification
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch (err) {}
    };

    const handleUpdatedAnnouncement = (data: { announcement: IAnnouncement }) => {
      setAnnouncements((prev) =>
        prev.map((a) => (a._id === data.announcement._id ? { ...a, ...data.announcement } : a))
      );
    };

    socket.on('announcement:new', handleNewAnnouncement);
    socket.on('announcement:updated', handleUpdatedAnnouncement);

    return () => {
      socket.off('announcement:new', handleNewAnnouncement);
      socket.off('announcement:updated', handleUpdatedAnnouncement);
    };
  }, [socket]);

  // Mark an announcement as read
  const handleMarkAsRead = async (id: string) => {
    const target = announcements.find((a) => a._id === id);
    if (!target || target.isRead) return;

    try {
      // Use the recorded read status endpoint
      await api.post(`/announcements/${id}/view`);
      setAnnouncements((prev) =>
        prev.map((a) => (a._id === id ? { ...a, isRead: true } : a))
      );
    } catch (err) {
      console.error('Failed to register announcement view:', err);
    }
  };

  // Create Announcement handler
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      await api.post('/announcements', {
        title,
        content,
        isPinned,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
        targetAudience: {
          department: targetDept.trim() || null,
          semester: targetSem ? parseInt(targetSem, 10) : null,
          section: targetSec.trim() || null,
        },
        attachments: attachmentsList,
      });

      // Clear form
      setTitle('');
      setContent('');
      setIsPinned(false);
      setScheduledFor('');
      setTargetDept('');
      setTargetSem('');
      setTargetSec('');
      setAttachmentsList([]);
      setAttachmentUrlInput('');
      setShowCreateForm(false);
      
      // Refresh feed
      loadAnnouncements();
    } catch (err) {
      console.error('Failed to publish announcement:', err);
    }
  };

  const handleAddAttachment = () => {
    if (attachmentUrlInput.trim()) {
      setAttachmentsList((prev) => [...prev, attachmentUrlInput.trim()]);
      setAttachmentUrlInput('');
    }
  };

  const isPrivileged = ['Admin', 'Faculty', 'HOD'].includes(user?.role || '');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title Panel */}
      <div className="flex justify-between items-center bg-white/70 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-500/10 rounded-xl text-primary-500">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">Notice Board</h2>
            <p className="text-xs text-slate-400">Campus bulletins, updates and notifications</p>
          </div>
        </div>
        {isPrivileged && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary-500/20 flex items-center gap-1.5"
          >
            {showCreateForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showCreateForm ? 'Cancel Notice' : 'Post Announcement'}
          </button>
        )}
      </div>

      {/* Creation form container */}
      {showCreateForm && isPrivileged && (
        <form
          onSubmit={handleCreateAnnouncement}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-primary-500 mb-1">
            <Sparkles className="h-4 w-4" />
            <span>Formulate Pinned Bulletin or Targeted Circular</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500">Title</label>
              <input
                type="text"
                placeholder="Circular title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 focus:outline-none border-none text-slate-800 dark:text-slate-150"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500">Scheduled Date (Optional)</label>
              <input
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 focus:outline-none border-none text-slate-800 dark:text-slate-150"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500">Notice Body Content</label>
            <textarea
              rows={4}
              placeholder="Write detailed circular contents here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 focus:outline-none border-none text-slate-800 dark:text-slate-150 resize-none"
            />
          </div>

          {/* Targeted Audience parameters */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <h4 className="text-xs font-bold text-slate-400 mb-2.5">Target Audience Segments (Optional)</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Department</label>
                <input
                  type="text"
                  placeholder="e.g. CSE, ECE"
                  value={targetDept}
                  onChange={(e) => setTargetDept(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 focus:outline-none border-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Semester</label>
                <input
                  type="number"
                  placeholder="e.g. 1 to 8"
                  value={targetSem}
                  onChange={(e) => setTargetSem(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 focus:outline-none border-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Section</label>
                <input
                  type="text"
                  placeholder="e.g. A, B"
                  value={targetSec}
                  onChange={(e) => setTargetSec(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 focus:outline-none border-none"
                />
              </div>
            </div>
          </div>

          {/* Attachments Input */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <label className="text-xs font-bold text-slate-500 block mb-1.5">Circular Attachment Links</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Paste document/image url..."
                value={attachmentUrlInput}
                onChange={(e) => setAttachmentUrlInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 focus:outline-none border-none"
              />
              <button
                type="button"
                onClick={handleAddAttachment}
                className="px-4 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold"
              >
                Add
              </button>
            </div>
            
            {attachmentsList.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {attachmentsList.map((url, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold border border-slate-200/40 dark:border-slate-700/40"
                  >
                    <Paperclip className="h-3 w-3" />
                    <span className="truncate max-w-[8rem]">{url}</span>
                    <button
                      type="button"
                      onClick={() => setAttachmentsList((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Toggle Pinned Option */}
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPinned"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 text-primary-600 bg-slate-100 rounded border-slate-300 focus:ring-primary-500"
              />
              <label htmlFor="isPinned" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer">
                <Pin className="h-3.5 w-3.5" /> Pin announcement to board top
              </label>
            </div>
            
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-xs shadow-lg transition-all"
            >
              Publish Notice
            </button>
          </div>
        </form>
      )}

      {/* Feed list */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-400 bg-white/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-center">
            <span className="animate-pulse font-bold text-xs">Synchronizing active bullet boards...</span>
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
            <ShieldAlert className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto stroke-1 mb-2" />
            <p className="text-xs font-bold">No announcements published</p>
            <p className="text-[10px] text-slate-450 mt-1">Circular bulletins from administration will appear here.</p>
          </div>
        ) : (
          announcements.map((ann) => (
            <div
              key={ann._id}
              onClick={() => handleMarkAsRead(ann._id)}
              className={`p-5 rounded-2xl border bg-white dark:bg-slate-900 transition-all ${
                ann.isPinned
                  ? 'border-primary-500 shadow-md shadow-primary-500/[0.03]'
                  : 'border-slate-200/60 dark:border-slate-800/60 hover:shadow-md'
              } ${!ann.isRead ? 'bg-primary-500/[0.01] dark:bg-primary-500/[0.02]' : ''}`}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-500 flex items-center justify-center text-xs font-bold overflow-hidden">
                    {ann.author.profileImage ? (
                      <img src={ann.author.profileImage} alt="" className="h-full w-full object-cover" />
                    ) : (
                      ann.author.name[0].toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      {ann.author.name}
                      <span className="px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {ann.author.role}
                      </span>
                    </h3>
                    <span className="text-[9px] font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {new Date(ann.scheduledFor).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {ann.isPinned && (
                    <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase bg-primary-500/15 text-primary-500 border border-primary-500/20 flex items-center gap-1 animate-pulse">
                      <Pin className="h-3 w-3" /> Pinned
                    </span>
                  )}
                  {!ann.isRead && (
                    <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      New notice
                    </span>
                  )}
                </div>
              </div>

              {/* Notice Title & Content */}
              <div className="mt-4">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                  {ann.title}
                </h4>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2 whitespace-pre-wrap leading-relaxed">
                  {ann.content}
                </p>
              </div>

              {/* Audience Targets Meta Tags */}
              <div className="mt-4 flex flex-wrap gap-1.5 items-center">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase mr-1">Audience:</span>
                {!ann.targetAudience.department && !ann.targetAudience.semester && !ann.targetAudience.section ? (
                  <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    Everyone
                  </span>
                ) : (
                  <>
                    {ann.targetAudience.department && (
                      <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-primary-500/5 text-primary-500 border border-primary-500/10">
                        Dept: {ann.targetAudience.department}
                      </span>
                    )}
                    {ann.targetAudience.semester && (
                      <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-primary-500/5 text-primary-500 border border-primary-500/10">
                        Sem: {ann.targetAudience.semester}
                      </span>
                    )}
                    {ann.targetAudience.section && (
                      <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-primary-500/5 text-primary-500 border border-primary-500/10">
                        Sec: {ann.targetAudience.section}
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Attachments Card Links list */}
              {ann.attachments && ann.attachments.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase block mb-2">Notice Documents / Attachments:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ann.attachments.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 truncate hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                      >
                        <Paperclip className="h-4 w-4 shrink-0 text-slate-450" />
                        <span className="truncate">{url}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementsFeed;
