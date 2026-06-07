import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  unit?: string;
  error?: string;
  helpText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, unit, error, helpText, className = '', id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        <label htmlFor={inputId} className="block text-xs font-mono text-slate-400">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={`w-full bg-slate-950 border rounded px-2 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 transition-colors ${
              error
                ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-800 focus:border-amber-500 focus:ring-amber-500/20'
            } ${className}`}
            {...props}
          />
          {unit && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono pointer-events-none">
              {unit}
            </span>
          )}
        </div>
        {error && <p className="text-[10px] text-rose-400">{error}</p>}
        {helpText && !error && <p className="text-[10px] text-slate-500">{helpText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';