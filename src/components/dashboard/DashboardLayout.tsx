'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { isAuthenticated, isVendor, getStoredUser } from '@/lib/auth';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import { getMe, type User, type StoreInfo } from '@/lib/api';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const locale = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [storeChecked, setStoreChecked] = useState(false);

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

    // Fetch fresh store status from API
    getMe(locale).then((res) => {
      if (res.data?.store) {
        setStoreInfo(res.data.store);
      }
      setStoreChecked(true);
    }).catch(() => {
      setStoreChecked(true);
    });
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

  const pathname = usePathname();
  // Allow subscription page even when store is inactive
  const isSubscriptionPage = pathname?.includes('/dashboard/subscription');
  // Store is not active — show blocking message on ALL dashboard pages except subscription
  const isStoreInactive = storeChecked && storeInfo && storeInfo.status !== 'active' && !isSubscriptionPage;

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
          {isStoreInactive ? (
            <StoreInactiveMessage storeInfo={storeInfo} locale={locale} userName={user?.name || ''} />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

function StoreInactiveMessage({ storeInfo, locale, userName }: { storeInfo: StoreInfo; locale: string; userName: string }) {
  const statusConfig: Record<string, { title: { ar: string; en: string }; icon: 'clock' | 'ban' | 'subscribe'; color: string; borderColor: string; bgColor: string }> = {
    pending_approval: {
      title: { ar: 'متجرك قيد المراجعة', en: 'Your store is under review' },
      icon: 'clock',
      color: 'text-blue-700',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50/30',
    },
    pending_activation: {
      title: { ar: 'متجرك قيد التفعيل', en: 'Your store is being activated' },
      icon: 'clock',
      color: 'text-blue-700',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50/30',
    },
    no_subscription: {
      title: { ar: 'اشترك في باقة لتفعيل متجرك', en: 'Subscribe to activate your store' },
      icon: 'subscribe',
      color: 'text-amber-700',
      borderColor: 'border-amber-200',
      bgColor: 'bg-amber-50/30',
    },
    suspended: {
      title: { ar: 'متجرك موقوف مؤقتاً', en: 'Your store is suspended' },
      icon: 'ban',
      color: 'text-red-700',
      borderColor: 'border-red-200',
      bgColor: 'bg-red-50/30',
    },
  };

  const config = statusConfig[storeInfo.status] || statusConfig.pending_activation;
  const title = locale === 'ar' ? config.title.ar : config.title.en;
  const iconBgMap: Record<string, string> = {
    'text-blue-700': 'bg-blue-100',
    'text-amber-700': 'bg-amber-100',
    'text-red-700': 'bg-red-100',
  };

  return (
    <div className="space-y-5">
      {/* Welcome */}
      <div>
        <h1
          className="text-2xl md:text-3xl font-semibold text-[var(--color-text)] mb-1"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {locale === 'ar' ? `أهلاً، ${userName}` : `Welcome, ${userName}`}
        </h1>
        <p className="text-sm text-[var(--color-text-light)]">
          {locale === 'ar' ? 'ده ملخص نشاط متجرك' : "Here's a summary of your store activity"}
        </p>
      </div>

      {/* Status card */}
      <div className={`bg-white rounded-2xl border ${config.borderColor} ${config.bgColor} p-8`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full ${iconBgMap[config.color]} ${config.color} flex items-center justify-center shrink-0`}>
            {config.icon === 'ban' ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            ) : config.icon === 'subscribe' ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {title}
            </h3>
            <p className="text-sm text-[var(--color-text-light)]">{storeInfo.message}</p>

            <div className="flex gap-2 pt-4">
              {storeInfo.status === 'no_subscription' && (
                <a href={`/${locale}/pricing`} className="bg-[var(--color-bg-dark)] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[var(--color-text)] transition-colors">
                  {locale === 'ar' ? 'تصفح الباقات' : 'Browse Plans'}
                </a>
              )}
              {(storeInfo.status === 'pending_approval' || storeInfo.status === 'pending_activation') && (
                <a href={`/${locale}/dashboard/subscription`} className="border border-[var(--color-border)] text-[var(--color-text)] text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[var(--color-bg-warm)] transition-colors">
                  {locale === 'ar' ? 'تفاصيل الاشتراك' : 'Subscription details'}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
