import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'default' | 'compact' | 'none';
}

export function Card({ children, className = '', padding = 'default' }: CardProps) {
  const paddingClasses = {
    default: 'p-4',
    compact: 'p-2',
    none: '',
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-lg ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}