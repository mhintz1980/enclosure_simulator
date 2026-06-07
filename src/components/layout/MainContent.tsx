import { ReactNode } from 'react';

interface MainContentProps {
  children: ReactNode;
  className?: string;
}

export function MainContent({ children, className = '' }: MainContentProps) {
  return (
    <main className={`flex-1 xl:col-span-8 ${className}`}>
      <div className="space-y-6">
        {children}
      </div>
    </main>
  );
}