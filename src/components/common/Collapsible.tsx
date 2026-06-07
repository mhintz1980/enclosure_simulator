import { useState, ReactNode } from 'react';

interface CollapsibleProps {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

export function Collapsible({
  title,
  children,
  defaultOpen = false,
  className = '',
  triggerClassName = '',
  contentClassName = '',
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border border-slate-800 rounded overflow-hidden text-[11px] ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 flex items-center justify-between text-slate-400 font-semibold ${triggerClassName}`}
      >
        <span>{title}</span>
        <span>{isOpen ? 'Collapse ▲' : 'Expand ▼'}</span>
      </button>
      {isOpen && (
        <div className={`p-2.5 bg-slate-950/60 space-y-1.5 text-slate-300 border-t border-slate-850 ${contentClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
}