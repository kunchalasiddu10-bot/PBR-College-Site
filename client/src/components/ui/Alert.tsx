import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface AlertProps {
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ type, message, className = '' }) => {
  const styles = {
    error:   'bg-stark-red/10 text-stark-red-bright border border-stark-red/30',
    success: 'bg-stark-cyan/10 text-stark-cyan border border-stark-cyan/30',
    warning: 'bg-stark-gold/10 text-stark-gold-bright border border-stark-gold/30',
    info:    'bg-stark-cyan/5 text-stark-muted border border-stark-border',
  };

  const icons = {
    error:   <XCircle className="h-4 w-4 shrink-0 text-stark-red-bright" />,
    success: <CheckCircle className="h-4 w-4 shrink-0 text-stark-cyan" />,
    warning: <AlertCircle className="h-4 w-4 shrink-0 text-stark-gold-bright" />,
    info:    <Info className="h-4 w-4 shrink-0 text-stark-muted" />,
  };

  const prefixes = {
    error:   'SYSTEM ALERT',
    success: 'ACCESS GRANTED',
    warning: 'WARNING',
    info:    'JARVIS INFO',
  };

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg text-xs font-display font-medium animate-fade-in ${styles[type]} ${className}`}>
      {icons[type]}
      <div className="flex-1">
        <span className="font-hud text-[10px] tracking-wider opacity-70 mr-2">[{prefixes[type]}]</span>
        {message}
      </div>
    </div>
  );
};

export default Alert;
