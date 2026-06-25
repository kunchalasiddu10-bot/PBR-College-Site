import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setShowPassword(!showPassword);
    };

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-hud uppercase tracking-widest text-stark-muted">
            {label}
          </label>
        )}
        <div className="relative w-full">
          <input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={`stark-input pr-11 ${
              error ? 'border-stark-red-bright' : ''
            } ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stark-dim hover:text-stark-red transition-colors focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
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

PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;
