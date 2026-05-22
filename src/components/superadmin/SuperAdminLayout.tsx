'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { isAuthenticated, isSuperAdmin, getStoredUser, logout } from '@/lib/auth';
import type { User } from '@/lib/api';
import SuperAdminSidebar from './SuperAdminSidebar';

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('pages.superadmin.nav');
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated() || !isSuperAdmin()) {
      router.push(`/${locale}`);
      return;
    }
    setUser(getStoredUser());
    setAuthChecked(true);
  }, [locale, router]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="w-10 h-10 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] animate-spin" />
      </div>
    );
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() || 'A';

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-e border-[var(--color-border-light)] bg-white">
        <SuperAdminSidebar locale={locale} />
      </aside>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-[var(--color-bg-dark)]/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
        <aside className={`absolute top-0 bottom-0 ${locale === 'ar' ? 'right-0' : 'left-0'} w-[280px] bg-white flex flex-col shadow-2xl`}>
          <SuperAdminSidebar locale={locale} onNavigate={() => setSidebarOpen(false)} />
        </aside>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-[var(--color-border-light)] px-5 md:px-8 py-3 flex items-center justify-between gap-4 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 rounded-lg border border-[var(--color-border)] flex items-center justify-center"
            aria-label="Menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="flex-1" />

          {/* Badge: super admin */}
          <span className="hidden sm:inline-block text-[10px] uppercase tracking-[0.2em] bg-[var(--color-bg-dark)] text-white px-2.5 py-1 rounded-full font-semibold">
            Super Admin
          </span>

          {/* User */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white flex items-center justify-center text-sm font-semibold">
              {initial}
            </div>
            <div className="hidden md:block text-start leading-tight">
              <div className="text-sm font-medium text-[var(--color-text)]">{user?.name}</div>
              <div className="text-[11px] text-[var(--color-text-muted)]">{user?.email}</div>
            </div>
            <button
              onClick={() => {
                logout();
                router.push(`/${locale}`);
              }}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-error)] p-2"
              aria-label="Logout"
              title={t('overview')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
