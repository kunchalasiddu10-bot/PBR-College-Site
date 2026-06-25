import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'gold' | 'cyan';
  isLoading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const variants = {
    primary:   'stark-btn-primary',
    secondary: 'stark-btn-outline',
    outline:   'stark-btn-outline',
    danger:    'stark-btn-danger',
    gold:      'stark-btn-gold',
    cyan:      'stark-btn-cyan',
  };

  return (
    <button
      className={`stark-btn ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <LoadingSpinner size="sm" className="border-t-transparent border-current" />
      )}
      {children}
    </button>
  );
};

export default Button;
