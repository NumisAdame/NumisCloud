'use client';

import { LandingHeader } from '@/components/landing/header';
import { FooterSection } from '@/components/landing/footer-section';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-graphite flex flex-col">
      <LandingHeader />
      <main className="flex-1 pt-20 pb-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          {children}
        </div>
      </main>
      <FooterSection />
    </div>
  );
}
