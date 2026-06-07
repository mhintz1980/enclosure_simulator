import { InputHTMLAttributes } from 'react';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  showValue?: boolean;
  className?: string;
}

export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  showValue = true,
  className = '',
  id,
  ...props
}: SliderProps) {
  const sliderId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-mono">
        <span className="text-slate-400">{label}</span>
        {showValue && (
          <span className="text-amber-400 font-bold">
            {value}{unit && ` ${unit}`}
          </span>
        )}
      </div>
      <input
        type="range"
        id={sliderId}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer ${className}`}
        {...props}
      />
    </div>
  );
}