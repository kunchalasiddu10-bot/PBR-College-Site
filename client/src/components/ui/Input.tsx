import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-hud uppercase tracking-widest text-stark-muted">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`stark-input ${
            error ? 'border-stark-red-bright focus:ring-stark-red-bright/50' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-stark-red-bright font-display animate-fade-in flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-stark-red-bright" />
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
