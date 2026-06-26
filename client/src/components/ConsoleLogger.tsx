import React, { useState, useEffect, useRef } from 'react';
import { Terminal, ShieldAlert, AlertTriangle, Info, X, Trash2, Copy, ArrowDown, Search, EyeOff, Maximize2, Minimize2 } from 'lucide-react';

interface LogItem {
  id: string;
  type: 'log' | 'warn' | 'error' | 'info';
  timestamp: string;
  text: string;
}

export const ConsoleLogger: React.FC = () => {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [filter, setFilter] = useState<'all' | 'log' | 'warn' | 'error'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [badgeCount, setBadgeCount] = useState({ warn: 0, error: 0 });

  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Format arguments to readable strings
  const formatArgs = (args: any[]): string => {
    return args
      .map((arg) => {
        if (arg === null) return 'null';
        if (arg === undefined) return 'undefined';
        if (arg instanceof Error) return arg.stack || arg.message;
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch (e) {
            return '[Circular Object]';
          }
        }
        return String(arg);
      })
      .join(' ');
  };

  useEffect(() => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;

    const addLog = (type: 'log' | 'warn' | 'error' | 'info', ...args: any[]) => {
      const text = formatArgs(args);
      const timestamp = new Date().toLocaleTimeString(undefined, {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const newLog: LogItem = {
        id: Math.random().toString(36).substring(2, 9),
        type,
        timestamp,
        text,
      };

      setLogs((prev) => {
        const updated = [...prev, newLog].slice(-250); // Keep last 250 logs
        return updated;
      });

      if (type === 'error') {
        setBadgeCount((prev) => ({ ...prev, error: prev.error + 1 }));
      } else if (type === 'warn') {
        setBadgeCount((prev) => ({ ...prev, warn: prev.warn + 1 }));
      }
    };

    // Override console functions
    console.log = (...args) => {
      originalLog.apply(console, args);
      addLog('log', ...args);
    };

    console.warn = (...args) => {
      originalWarn.apply(console, args);
      addLog('warn', ...args);
    };

    console.error = (...args) => {
      originalError.apply(console, args);
      addLog('error', ...args);
    };

    console.info = (...args) => {
      originalInfo.apply(console, args);
      addLog('info', ...args);
    };

    // Catch unhandled runtime errors
    const handleGlobalError = (event: ErrorEvent) => {
      addLog('error', `Runtime Error: ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`);
    };

    // Catch unhandled promise rejections
    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      addLog('error', `Unhandled Promise Rejection: ${formatArgs([event.reason])}`);
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);

    // Initial load logs
    addLog('info', 'JARVIS Debug Console Initialized. Monitoring active...');

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      console.info = originalInfo;
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, []);

  // Handle auto-scroll
  useEffect(() => {
    if (autoScroll && logsEndRef.current && isOpen && !isMinimized) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll, isOpen, isMinimized, filter, searchQuery]);

  const clearLogs = () => {
    setLogs([]);
    setBadgeCount({ warn: 0, error: 0 });
  };

  const copyToClipboard = () => {
    const text = logs
      .map((log) => `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.text}`)
      .join('\n');
    navigator.clipboard.writeText(text).then(() => {
      alert('Console logs copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy logs', err);
    });
  };

  const filteredLogs = logs.filter((log) => {
    // Type Filter
    if (filter !== 'all') {
      if (filter === 'log' && log.type !== 'log' && log.type !== 'info') return false;
      if (filter !== 'log' && log.type !== filter) return false;
    }
    // Search Query
    if (searchQuery.trim()) {
      return log.text.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className="fixed bottom-4 left-4 z-[9999] p-3 rounded-full bg-stark-panel border-2 border-stark-cyan text-stark-cyan shadow-arc hover:bg-stark-cyan/10 hover:scale-110 active:scale-95 transition-all flex items-center justify-center gap-2 group"
        title="Open JARVIS Console"
      >
        <Terminal className="h-5 w-5 animate-pulse" />
        <span className="font-hud text-xs font-bold tracking-widest hidden group-hover:inline max-w-0 group-hover:max-w-xs transition-all duration-300 overflow-hidden uppercase">
          JARVIS Console
        </span>

        {/* Warning/Error Badges */}
        {(badgeCount.error > 0 || badgeCount.warn > 0) && (
          <div className="absolute -top-2 -right-2 flex gap-1">
            {badgeCount.error > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-stark-red text-white text-[9px] font-hud font-bold shadow-red-sm animate-red-pulse">
                {badgeCount.error}
              </span>
            )}
            {badgeCount.warn > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-stark-gold text-stark-bg text-[9px] font-hud font-bold shadow-gold-sm">
                {badgeCount.warn}
              </span>
            )}
          </div>
        )}
      </button>
    );
  }

  return (
    <div
      className={`fixed left-4 right-4 z-[9999] hud-panel transition-all duration-300 overflow-hidden ${
        isMinimized
          ? 'bottom-4 h-12'
          : 'bottom-4 h-[380px] md:h-[450px] border-stark-cyan/40 shadow-arc'
      }`}
    >
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-stark-surface/90 border-b border-stark-border/60 select-none">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-stark-cyan animate-arc-pulse" />
          <span className="font-hud text-[11px] font-bold tracking-widest text-stark-cyan uppercase flex items-center gap-1.5">
            JARVIS Diagnostics Console
          </span>
          {logs.length > 0 && (
            <span className="hud-badge-dim text-[8px] scale-90">
              {logs.length} events
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Stats */}
          {!isMinimized && (
            <div className="flex gap-2 mr-4 text-[10px] font-hud">
              <span className="text-stark-red font-semibold flex items-center gap-1">
                ERR: {badgeCount.error}
              </span>
              <span className="text-stark-gold font-semibold flex items-center gap-1">
                WRN: {badgeCount.warn}
              </span>
            </div>
          )}

          {/* Copy Button */}
          {!isMinimized && (
            <button
              onClick={copyToClipboard}
              className="p-1 rounded text-stark-muted hover:text-stark-cyan transition-colors"
              title="Copy All Logs"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Clear Button */}
          {!isMinimized && (
            <button
              onClick={clearLogs}
              className="p-1 rounded text-stark-muted hover:text-stark-red transition-colors"
              title="Clear Logs"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Minimize / Maximize */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded text-stark-muted hover:text-stark-text transition-colors"
            title={isMinimized ? 'Expand Console' : 'Minimize Console'}
          >
            {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
          </button>

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded text-stark-muted hover:text-stark-red transition-colors"
            title="Close Console"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Console Body */}
      {!isMinimized && (
        <div className="flex flex-col h-[calc(100%-48px)] bg-stark-bg/95">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-2 bg-stark-surface/40 border-b border-stark-border/30">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1">
              {(['all', 'log', 'warn', 'error'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-2.5 py-1 rounded text-[10px] font-hud tracking-wider transition-all uppercase ${
                    filter === tab
                      ? tab === 'error'
                        ? 'bg-stark-red/20 text-stark-red border border-stark-red/40'
                        : tab === 'warn'
                        ? 'bg-stark-gold/20 text-stark-gold border border-stark-gold/40'
                        : 'bg-stark-cyan/20 text-stark-cyan border border-stark-cyan/40'
                      : 'text-stark-muted hover:text-stark-text border border-transparent'
                  }`}
                >
                  {tab === 'log' ? 'Logs' : tab === 'warn' ? 'Warnings' : tab === 'error' ? 'Errors' : 'All'}
                </button>
              ))}
            </div>

            {/* Search and Autoscroll */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-48">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-stark-dim" />
                <input
                  type="text"
                  placeholder="Filter logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stark-surface border border-stark-border hover:border-stark-cyan/40 focus:border-stark-cyan text-stark-text text-[11px] font-display pl-7 pr-2 py-1 rounded outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stark-dim hover:text-stark-text"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={`p-1.5 rounded transition-all flex items-center gap-1 text-[10px] font-hud uppercase ${
                  autoScroll
                    ? 'text-stark-cyan bg-stark-cyan/10 border border-stark-cyan/30'
                    : 'text-stark-dim hover:text-stark-muted border border-transparent'
                }`}
                title="Toggle Auto-Scroll"
              >
                <ArrowDown className={`h-3 w-3 ${autoScroll ? 'animate-bounce' : ''}`} />
                <span className="hidden sm:inline">Scroll Lock</span>
              </button>
            </div>
          </div>

          {/* Log Stream */}
          <div
            ref={logsContainerRef}
            className="flex-1 overflow-y-auto p-2 font-mono text-[11px] leading-relaxed select-text space-y-1"
          >
            {filteredLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-stark-dim font-display">
                <EyeOff className="h-8 w-8 mb-2 stroke-[1.5]" />
                <p className="font-hud text-xs uppercase tracking-wider">No Matching Records</p>
                <p className="text-[10px] mt-1">Ready for input commands...</p>
              </div>
            ) : (
              filteredLogs.map((log) => {
                let colorClass = 'text-stark-muted';
                let icon = <Info className="h-3 w-3 text-stark-muted flex-shrink-0 mt-0.5" />;
                let bgClass = 'bg-transparent';

                if (log.type === 'error') {
                  colorClass = 'text-red-400 font-semibold';
                  bgClass = 'bg-stark-red/10 border-l-2 border-stark-red px-2 py-1 my-0.5 rounded';
                  icon = <ShieldAlert className="h-3 w-3 text-red-400 flex-shrink-0 mt-0.5" />;
                } else if (log.type === 'warn') {
                  colorClass = 'text-stark-gold';
                  bgClass = 'bg-stark-gold/5 border-l-2 border-stark-gold px-2 py-1 my-0.5 rounded';
                  icon = <AlertTriangle className="h-3 w-3 text-stark-gold flex-shrink-0 mt-0.5" />;
                } else if (log.type === 'info') {
                  colorClass = 'text-stark-cyan';
                  icon = <Terminal className="h-3 w-3 text-stark-cyan flex-shrink-0 mt-0.5" />;
                }

                return (
                  <div
                    key={log.id}
                    className={`flex items-start gap-2 ${bgClass} transition-colors hover:bg-white/[0.02]`}
                  >
                    <span className="text-stark-dim font-hud flex-shrink-0 font-light tracking-tight">
                      [{log.timestamp}]
                    </span>
                    {icon}
                    <pre className={`flex-1 whitespace-pre-wrap break-all ${colorClass}`}>
                      {log.text}
                    </pre>
                  </div>
                );
              })
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsoleLogger;
