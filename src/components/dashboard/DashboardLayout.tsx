'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { isAuthenticated, isVendor, getStoredUser } from '@/lib/auth';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import type { User } from '@/lib/api';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const locale = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push(`/${locale}`);
      return;
    }
    if (!isVendor()) {
      router.push(`/${locale}`);
      return;
    }
    setUser(getStoredUser());
    setAuthChecked(true);
  }, [locale, router]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] animate-spin" />
          <p className="text-sm text-[var(--color-text-muted)]">...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-e border-[var(--color-border-light)] bg-white">
        <Sidebar locale={locale} onNavigate={() => setSidebarOpen(false)} />
      </aside>

      {/* Sidebar (mobile drawer) */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-[var(--color-bg-dark)]/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
        <aside className={`absolute top-0 bottom-0 ${locale === 'ar' ? 'right-0' : 'left-0'} w-[280px] bg-white flex flex-col shadow-2xl transition-transform ${sidebarOpen ? 'translate-x-0' : (locale === 'ar' ? 'translate-x-full' : '-translate-x-full')}`}>
          <Sidebar locale={locale} onNavigate={() => setSidebarOpen(false)} />
        </aside>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader user={user} locale={locale} onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 p-5 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
