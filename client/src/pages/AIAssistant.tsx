import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  MessageSquare,
  Plus,
  Trash2,
  Send,
  Settings,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Sparkles,
  Menu,
  X,
  Bookmark,
  ChevronRight,
  Shield,
  Bot,
  User,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface Message {
  _id?: string;
  role: 'user' | 'assistant';
  message: string;
  timestamp: string;
}

interface Session {
  _id: string;
  title: string;
  createdAt: string;
}

interface SavedPrompt {
  _id: string;
  title: string;
  promptText: string;
}

interface Preferences {
  aiVoiceEnabled: boolean;
  themePreference: 'light' | 'dark';
  defaultSuggestions: string[];
}

export const AIAssistant: React.FC = () => {
  const { user } = useAuth();
  
  // States
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [newPromptText, setNewPromptText] = useState('');
  const [showPromptModal, setShowPromptModal] = useState(false);
  
  const [preferences, setPreferences] = useState<Preferences>({
    aiVoiceEnabled: false,
    themePreference: 'light',
    defaultSuggestions: []
  });
  
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI Panels
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load initial data: Sessions, Saved Prompts, and Preferences
  useEffect(() => {
    const initData = async () => {
      try {
        setLoadingSessions(true);
        const [sessionRes, promptRes, prefRes] = await Promise.all([
          api.get('/ai/sessions'),
          api.get('/ai/saved-prompts'),
          api.get('/ai/preferences')
        ]);
        
        const loadedSessions = sessionRes.data.data.sessions;
        setSessions(loadedSessions);
        setSavedPrompts(promptRes.data.data.savedPrompts);
        
        if (prefRes.data.data.preferences) {
          setPreferences(prefRes.data.data.preferences);
        }

        // Set the active session to the latest session if available
        if (loadedSessions.length > 0) {
          setActiveSessionId(loadedSessions[0]._id);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to initialize AI workspace.');
      } finally {
        setLoadingSessions(false);
      }
    };

    initData();
  }, []);

  // Fetch messages when active session changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeSessionId) {
        setMessages([]);
        return;
      }

      try {
        setLoadingMessages(true);
        const res = await api.get(`/ai/sessions/${activeSessionId}/messages`);
        setMessages(res.data.data.messages);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load messages.');
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
    
    // Stop speaking when switching sessions
    stopSpeaking();
  }, [activeSessionId]);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sendingMessage]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Speech helper functions
  const speakText = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    if (currentlySpeakingId === msgId) {
      stopSpeaking();
      return;
    }

    stopSpeaking();

    // Clean markdown characters for cleaner text-to-speech output
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/-\s/g, '')
      .replace(/#+/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => {
      setCurrentlySpeakingId(null);
    };
    utterance.onerror = () => {
      setCurrentlySpeakingId(null);
    };

    speechUtteranceRef.current = utterance;
    setCurrentlySpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentlySpeakingId(null);
    speechUtteranceRef.current = null;
  };

  // Create a new empty session
  const handleNewSession = async () => {
    try {
      const res = await api.post('/ai/sessions', { title: 'New Conversation' });
      const newSession = res.data.data.session;
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession._id);
      setMessages([]);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create a new session.');
    }
  };

  // Delete a session
  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting the deleted session
    try {
      await api.delete(`/ai/sessions/${id}`);
      setSessions((prev) => prev.filter((s) => s._id !== id));
      if (activeSessionId === id) {
        const remaining = sessions.filter((s) => s._id !== id);
        setActiveSessionId(remaining.length > 0 ? remaining[0]._id : null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to clear session.');
    }
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    if (!textToSend) setInputMessage('');
    setError(null);
    setSendingMessage(true);

    // Optimistic UI updates
    const userMsg: Message = {
      role: 'user',
      message: text,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      // 1. Determine session ID. If none active, route will auto-create one.
      const payload: any = { question: text };
      if (activeSessionId) {
        payload.sessionId = activeSessionId;
      }

      const res = await api.post('/ai/chat', payload);
      const { answer, sessionId, sessionTitle } = res.data.data;

      // Update active session list if it was a new session auto-created
      if (!activeSessionId) {
        const newSess: Session = {
          _id: sessionId,
          title: sessionTitle,
          createdAt: new Date().toISOString()
        };
        setSessions((prev) => [newSess, ...prev]);
        setActiveSessionId(sessionId);
      } else {
        // Update title if it was named "New Conversation"
        setSessions((prev) =>
          prev.map((s) => (s._id === sessionId && s.title === 'New Conversation' ? { ...s, title: sessionTitle } : s))
        );
      }

      // Add assistant response
      const assistantMsg: Message = {
        role: 'assistant',
        message: answer,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // If preferences has TTS active by default, read out loud
      if (preferences.aiVoiceEnabled) {
        speakText(answer, `ai-auto-${Date.now()}`);
      }

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to query the AI assistant.');
      // Remove the optimistically added user message on failure
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSendingMessage(false);
    }
  };

  // Copy message text to clipboard
  const handleCopyMessage = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Add a saved prompt shortcut
  const handleAddSavedPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromptTitle.trim() || !newPromptText.trim()) return;

    try {
      const res = await api.post('/ai/saved-prompts', {
        title: newPromptTitle,
        promptText: newPromptText
      });
      setSavedPrompts((prev) => [...prev, res.data.data.savedPrompt]);
      setNewPromptTitle('');
      setNewPromptText('');
      setShowPromptModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save prompt.');
    }
  };

  // Delete saved prompt
  const handleDeletePrompt = async (id: string) => {
    try {
      await api.delete(`/ai/saved-prompts/${id}`);
      setSavedPrompts((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete saved prompt.');
    }
  };

  // Update preferences
  const handleUpdatePreference = async (updates: Partial<Preferences>) => {
    try {
      const newPrefs = { ...preferences, ...updates };
      setPreferences(newPrefs);
      await api.patch('/ai/preferences', updates);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update preferences.');
    }
  };

  // Role suggestions mapping
  const getSuggestions = () => {
    if (user?.role === 'Admin') {
      return [
        { label: 'Students enrolled', text: 'How many students are enrolled?' },
        { label: 'Dept attendance summary', text: 'Show the department attendance summary' },
        { label: 'Placement statistics', text: 'What are the campus placement drive statistics?' },
        { label: 'Complaint tickets status', text: 'Give me a summary of complaint tickets' }
      ];
    } else if (user?.role === 'Faculty' || user?.role === 'HOD') {
      return [
        { label: 'Today\'s teaching classes', text: 'Show me my class schedule today' },
        { label: 'Low attendance students', text: 'Which students have low attendance below 75%?' },
        { label: 'Pending submissions to grade', text: 'Show student assignments pending grading' }
      ];
    } else {
      // Default to Student role
      return [
        { label: 'My overall attendance rate', text: 'What is my attendance?' },
        { label: 'Weekly schedule / Today class', text: 'What is my class timetable today?' },
        { label: 'Upcoming semester exams', text: 'Show my upcoming examinations calendar' },
        { label: 'Pending assignments due', text: 'What are my pending assignments?' },
        { label: 'Cumulative CGPA & grades', text: 'Show my cgpa and past semester grades' },
        { label: 'Library books borrowed', text: 'What books do I have issued from the library?' }
      ];
    }
  };

  // Parse simple custom Markdown elements into JSX elements
  const formatMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      let trimmed = line.trim();

      // Check for bullet items
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.substring(2);
        return (
          <li key={lineIdx} className="ml-4 list-disc text-slate-700 dark:text-slate-355 text-sm my-1">
            {renderInlineMarkdown(content)}
          </li>
        );
      }

      // Check for headers
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={lineIdx} className="text-sm font-bold text-slate-800 dark:text-white mt-3 mb-1 uppercase tracking-wider">
            {renderInlineMarkdown(trimmed.substring(4))}
          </h4>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={lineIdx} className="text-base font-extrabold text-slate-900 dark:text-white mt-4 mb-2">
            {renderInlineMarkdown(trimmed.substring(3))}
          </h3>
        );
      }
      if (trimmed.startsWith('# ')) {
        return (
          <h2 key={lineIdx} className="text-lg font-black text-slate-900 dark:text-white mt-4 mb-2">
            {renderInlineMarkdown(trimmed.substring(2))}
          </h2>
        );
      }

      // Standard text line
      return (
        <p key={lineIdx} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed my-1.5 min-h-[1rem]">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  // Inline formatting helper for bold, code tags, etc.
  const renderInlineMarkdown = (text: string) => {
    if (!text) return '';

    // Regex to split on bold segments **bold** or inline code `code`
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-extrabold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-xs font-mono font-bold text-primary-500">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex h-[82vh] rounded-3xl overflow-hidden glass-card relative border border-slate-200/50 dark:border-slate-800/50">
      
      {/* Sidebar - Sessions and Quick Links */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="h-full border-r border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col shrink-0 overflow-hidden"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-200/30 dark:border-slate-800/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary-500/10 text-primary-500">
                  <Bot className="h-4 w-4" />
                </div>
                <span className="font-extrabold text-sm text-slate-800 dark:text-white tracking-tight uppercase">Conversations</span>
              </div>
              <button
                onClick={handleNewSession}
                title="New chat session"
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Session Scroll Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {loadingSessions ? (
                <div className="h-20 flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 px-4 text-xs font-semibold text-slate-400">
                  No chat history saved yet.
                </div>
              ) : (
                sessions.map((sess) => (
                  <div
                    key={sess._id}
                    onClick={() => setActiveSessionId(sess._id)}
                    className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-200 ${
                      activeSessionId === sess._id
                        ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                        : 'hover:bg-slate-250 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden w-full">
                      <MessageSquare className={`h-4 w-4 shrink-0 ${activeSessionId === sess._id ? 'text-white' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold truncate pr-2 w-full">{sess.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(sess._id, e)}
                      title="Delete chat session"
                      className={`opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/20 text-red-500 transition-all ${
                        activeSessionId === sess._id ? 'text-white hover:text-red-200' : 'text-slate-400 hover:text-red-500'
                      }`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Sidebar Footer / Saved Prompts Panel */}
            <div className="p-4 border-t border-slate-200/30 dark:border-slate-800/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Saved Prompt Shortcuts</span>
                <button
                  onClick={() => setShowPromptModal(true)}
                  className="text-[10px] font-bold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-0.5"
                >
                  <Plus className="h-3 w-3" /> Save current
                </button>
              </div>

              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {savedPrompts.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic">No saved prompts.</p>
                ) : (
                  savedPrompts.map((p) => (
                    <div
                      key={p._id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/30 dark:border-slate-800/30 text-[11px] font-semibold text-slate-600 dark:text-slate-450 hover:border-primary-500/30 cursor-pointer"
                      onClick={() => handleSendMessage(p.promptText)}
                    >
                      <span className="truncate pr-1 hover:text-primary-500 transition-colors w-full">{p.title}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePrompt(p._id);
                        }}
                        className="text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Conversation Window */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900/40 relative">
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-450 transition-colors"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm text-slate-800 dark:text-white tracking-tight uppercase">
                  CampusVerse AI
                </h2>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary-100 dark:bg-primary-950/30 text-[9px] font-black uppercase text-primary-600 dark:text-primary-400 tracking-wider">
                  <Sparkles className="h-2.5 w-2.5" /> Offline RAG
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                Authenticated Sandbox | Role: <span className="text-primary-500">{user?.role}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick sound toggle */}
            <button
              onClick={() => handleUpdatePreference({ aiVoiceEnabled: !preferences.aiVoiceEnabled })}
              className={`p-2 rounded-xl transition-all duration-200 ${
                preferences.aiVoiceEnabled
                  ? 'bg-primary-500/10 text-primary-500'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400'
              }`}
              title={preferences.aiVoiceEnabled ? 'AI Voice readout enabled' : 'AI Voice readout disabled'}
            >
              {preferences.aiVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            {/* Preferences / settings toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl transition-all duration-200 ${
                showSettings
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400'
              }`}
              title="Assistant Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-3 bg-red-500/10 text-red-500 text-xs font-semibold flex items-center gap-2 border-b border-red-500/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-500">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loadingMessages ? (
            <div className="h-full flex flex-col justify-center items-center gap-2">
              <LoadingSpinner size="lg" />
              <p className="text-xs font-semibold text-slate-400">Retrieving conversation logs...</p>
            </div>
          ) : messages.length === 0 ? (
            /* Welcome Empty State */
            <div className="h-full flex flex-col justify-center items-center max-w-xl mx-auto text-center space-y-6 py-8">
              <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-primary-500 to-sky-400 text-white flex items-center justify-center shadow-lg shadow-primary-500/20 animate-pulse">
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  College AI RAG Assistant
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                  Ask me questions in natural language. I query the live campus database and compile answers with 0% hallucination rates. Your queries are fully sandboxed.
                </p>
              </div>

              {/* Suggestions Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-4">
                {getSuggestions().map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(sug.text)}
                    className="p-3 text-left rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 hover:bg-primary-50/30 hover:border-primary-500/30 hover:shadow-sm dark:bg-slate-950/10 dark:hover:bg-primary-950/10 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] font-black uppercase text-slate-400 group-hover:text-primary-500 tracking-wider">
                        Shortcut
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-primary-500 transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 leading-snug">
                      {sug.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Dialogue Bubbles */
            <div className="space-y-6">
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                const msgId = msg._id || `msg-${index}`;

                return (
                  <div key={msgId} className={`flex items-start gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    
                    {/* Assistant Profile Circle */}
                    {!isUser && (
                      <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-tr from-primary-500 to-sky-400 text-white flex items-center justify-center shadow-md shadow-primary-500/10 shrink-0 mt-0.5">
                        <Bot className="h-4.5 w-4.5" />
                      </div>
                    )}

                    <div className={`max-w-[80%] flex flex-col space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
                      {/* Bubble content wrapper */}
                      <div
                        className={`p-4 rounded-3xl text-slate-800 dark:text-slate-200 ${
                          isUser
                            ? 'bg-primary-500 text-white rounded-tr-none shadow-md shadow-primary-500/15'
                            : 'bg-slate-100/80 dark:bg-slate-850/80 border border-slate-200/50 dark:border-slate-800/40 rounded-tl-none'
                        }`}
                      >
                        {isUser ? (
                          <p className="text-sm leading-relaxed">{msg.message}</p>
                        ) : (
                          <div className="space-y-1">
                            {formatMarkdown(msg.message)}
                          </div>
                        )}
                      </div>

                      {/* Message Footer Utilities (Time, Copy, Sound) */}
                      <div className="flex items-center gap-3 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {!isUser && (
                          <div className="flex items-center gap-2">
                            {/* Copy button */}
                            <button
                              onClick={() => handleCopyMessage(msg.message, msgId)}
                              className="hover:text-primary-500 flex items-center gap-0.5 transition-colors"
                              title="Copy response text"
                            >
                              {copiedMessageId === msgId ? (
                                <>
                                  <Check className="h-3 w-3 text-green-500" />
                                  <span className="text-green-500">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>

                            {/* TTS Speak button */}
                            <button
                              onClick={() => speakText(msg.message, msgId)}
                              className={`flex items-center gap-0.5 transition-colors ${
                                currentlySpeakingId === msgId ? 'text-green-500' : 'hover:text-primary-500'
                              }`}
                              title={currentlySpeakingId === msgId ? 'Stop Speech' : 'Speak Text'}
                            >
                              {currentlySpeakingId === msgId ? (
                                <>
                                  <VolumeX className="h-3 w-3" />
                                  <span>Stop</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="h-3 w-3" />
                                  <span>Listen</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* User Profile Circle */}
                    {isUser && (
                      <div className="h-8.5 w-8.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-350 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="h-4.5 w-4.5" />
                      </div>
                    )}

                  </div>
                );
              })}

              {/* Typing / Sending Indicator */}
              {sendingMessage && (
                <div className="flex items-start gap-3.5 justify-start">
                  <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-tr from-primary-500 to-sky-400 text-white flex items-center justify-center shadow-md shadow-primary-500/10 shrink-0 mt-0.5">
                    <Bot className="h-4.5 w-4.5" />
                  </div>
                  <div className="p-4 rounded-3xl bg-slate-100/80 dark:bg-slate-850/80 border border-slate-200/50 dark:border-slate-800/40 rounded-tl-none flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Tray */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-950/10 flex flex-col gap-2">
          
          {/* Quick-select prompt bar (if list of sessions isn't empty) */}
          {messages.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 pl-1 pr-4 max-w-full">
              {getSuggestions().slice(0, 3).map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sug.text)}
                  className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full border border-slate-200 dark:border-slate-800 bg-white hover:border-primary-500 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 shrink-0 transition-colors"
                >
                  {sug.label}
                </button>
              ))}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-3 relative"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Query ERP database (e.g. attendance percentage, exam dates)..."
                disabled={sendingMessage || loadingMessages}
                className="w-full pl-4 pr-24 py-3 text-sm rounded-2xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 dark:focus:border-primary-500 transition-colors disabled:opacity-50"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {/* Save shortcut button */}
                <button
                  type="button"
                  onClick={() => {
                    setNewPromptText(inputMessage);
                    setShowPromptModal(true);
                  }}
                  disabled={!inputMessage.trim()}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-primary-500 disabled:opacity-40 disabled:hover:text-slate-400 transition-colors"
                  title="Save current string as shortcut"
                >
                  <Bookmark className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!inputMessage.trim() || sendingMessage || loadingMessages}
              className="p-3 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white shadow-md shadow-primary-500/20 transition-all disabled:opacity-50 disabled:bg-slate-350 disabled:shadow-none"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>
        </div>

        {/* User Preferences / Settings Popover Sidebar */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-80 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10 flex flex-col space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-850 pb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-primary-500" />
                  <span className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-tight">AI Settings</span>
                </div>
                <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Settings parameters */}
              <div className="space-y-5 flex-1">
                {/* Voice Enabled Parameter */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">AI Voice Readout</label>
                    <span className="text-[10px] text-slate-450 block leading-tight mt-0.5">Automatically speak answers using text-to-speech.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.aiVoiceEnabled}
                    onChange={(e) => handleUpdatePreference({ aiVoiceEnabled: e.target.checked })}
                    className="h-4 w-4 accent-primary-500 rounded"
                  />
                </div>

                {/* Theme Mode Parameter */}
                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-2">Theme Preference</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleUpdatePreference({ themePreference: 'light' })}
                      className={`px-3 py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                        preferences.themePreference === 'light'
                          ? 'border-primary-500 text-primary-500 bg-primary-500/5'
                          : 'border-slate-200/60 dark:border-slate-800 text-slate-500'
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => handleUpdatePreference({ themePreference: 'dark' })}
                      className={`px-3 py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                        preferences.themePreference === 'dark'
                          ? 'border-primary-500 text-primary-500 bg-primary-500/5'
                          : 'border-slate-200/60 dark:border-slate-800 text-slate-500'
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>

                {/* Sandbox Integrity Note */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border text-slate-500 text-[10px] font-semibold space-y-1">
                  <div className="flex items-center gap-1.5 text-primary-500">
                    <Shield className="h-3.5 w-3.5" />
                    <span className="font-extrabold uppercase tracking-wider">Security Sandbox</span>
                  </div>
                  <p className="leading-relaxed">
                    This assistant evaluates live parameters offline. No tokens are sent over external networks. Role parameters isolate results to prevent unauthorized views.
                  </p>
                </div>
              </div>

              {/* Settings footer */}
              <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                CampusVerse ERP v1.0.0
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Save Prompt Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md p-6 rounded-3xl glass-card border border-slate-200 dark:border-slate-850 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-tight">Save Prompt Shortcut</h3>
              <button onClick={() => setShowPromptModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleAddSavedPrompt} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Shortcut Title</label>
                <input
                  type="text"
                  required
                  value={newPromptTitle}
                  onChange={(e) => setNewPromptTitle(e.target.value)}
                  placeholder="e.g. My Attendance Check"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Prompt Text</label>
                <textarea
                  required
                  rows={3}
                  value={newPromptText}
                  onChange={(e) => setNewPromptText(e.target.value)}
                  placeholder="The text pattern queries the database..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowPromptModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-primary-500 text-white hover:bg-primary-600 shadow-md shadow-primary-500/25"
                >
                  Save Shortcut
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default AIAssistant;
