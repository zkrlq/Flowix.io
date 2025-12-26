import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { MobileHeader } from './MobileHeader';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileHeader title={title} />
      
      <main className="lg:pl-64">
        <div className="px-4 py-4 lg:px-8 lg:py-6 pb-24 lg:pb-6">
          {children}
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
