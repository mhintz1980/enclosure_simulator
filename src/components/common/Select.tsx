import { SelectHTMLAttributes, forwardRef, ChangeEvent } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  label: string;
  options: SelectOption[];
  error?: string;
  helpText?: string;
  className?: string;
  onChange?: (value: string) => void;
  value?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helpText, className = '', id, onChange, value, ...props }, ref) => {
    const selectId = id || label.toLowerCase().replace(/\s+/g, '-');

    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className="space-y-1.5">
        <label htmlFor={selectId} className="block text-xs font-mono text-slate-400">
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          value={value}
          className={`w-full bg-slate-950 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 transition-colors ${
            error
              ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-800 focus:border-amber-500 focus:ring-amber-500/20'
          } ${className}`}
          onChange={handleChange}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-[10px] text-rose-400">{error}</p>}
        {helpText && !error && <p className="text-[10px] text-slate-500">{helpText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';