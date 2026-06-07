import { ReactNode } from 'react';

interface SidebarProps {
  children: ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export function Sidebar({ children, isOpen, onClose, className = '' }: SidebarProps) {
  return (
    <aside
      className={`${className} fixed inset-y-0 left-0 z-50 w-80 bg-slate-950 border-r border-slate-800 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-auto lg:border-0 lg:bg-transparent lg:z-auto ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      aria-hidden={!isOpen}
    >
      <div className="lg:hidden p-4 border-b border-slate-800 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white"
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>
      <div className="p-4 lg:p-6 space-y-6 overflow-y-auto h-full lg:h-auto lg:overflow-visible">
        {children}
      </div>
    </aside>
  );
}