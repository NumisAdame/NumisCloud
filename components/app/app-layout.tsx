'use client';

import { AppSidebar } from './app-sidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="lg:ml-60 pt-14 lg:pt-0 min-h-screen">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
