import React from 'react';

interface FormWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export const FormWrapper: React.FC<FormWrapperProps> = ({
  children,
  title,
  subtitle,
  className = '',
}) => {
  return (
    <div className={`w-full max-w-md animate-slide-up ${className}`}>
      {/* HUD Panel */}
      <div className="hud-panel p-8 sm:p-10">
        {/* Corner decorators */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-stark-red/60" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-stark-red/60" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-stark-red/60" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-stark-red/60" />

        {/* Header */}
        <div className="flex flex-col gap-2 mb-8">
          {/* Status indicator */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-stark-cyan animate-arc-pulse" />
            <span className="font-hud text-[10px] tracking-[0.3em] text-stark-cyan uppercase">
              Stark Protocol · Secure Access
            </span>
          </div>

          <h2 className="font-hud text-2xl font-bold text-stark-text text-glow-red">
            {title}
          </h2>
          {subtitle && (
            <p className="font-display text-sm text-stark-muted leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {children}
      </div>
    </div>
  );
};

export default FormWrapper;
