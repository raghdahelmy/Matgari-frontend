'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
import { getUnreadCount } from '@/lib/tenantApi';
import { buildStoreUrl } from '@/lib/storeUrl';
import { Link, usePathname } from '@/i18n/navigation';
import type { User } from '@/lib/api';

interface Props {
  user: User | null;
  locale: string;
  onMenuToggle: () => void;
}

export default function DashboardHeader({ user, locale, onMenuToggle }: Props) {
  const t = useTranslations('pages.dashboard.nav');
  const router = useRouter();
  const pathname = usePathname();
  const otherLocale = locale === 'ar' ? 'en' : 'ar';
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Live notification count (poll every 30s)
  useEffect(() => {
    let active = true;
    const fetchCount = async () => {
      const res = await getUnreadCount();
      if (active && res.status && res.data) {
        setUnreadCount(res.data.count ?? 0);
      }
    };
    fetchCount();
    const id = setInterval(fetchCount, 30000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push(`/${locale}`);
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() || 'V';
  const storeUrl = user?.store_name ? buildStoreUrl(user.store_name, locale) : null;

  const copyStoreLink = async () => {
    if (!storeUrl) return;
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(locale === 'ar' ? 'انسخ اللينك:' : 'Copy link:', storeUrl);
    }
  };

  return (
    <header className="bg-white border-b border-[var(--color-border-light)] px-5 md:px-8 py-3 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Mobile menu */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden w-9 h-9 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)]"
        aria-label="Menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Search (placeholder) */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <input
            type="text"
            placeholder={locale === 'ar' ? 'بحث...' : 'Search...'}
            className="w-full bg-[var(--color-bg)] border border-[var(--color-border-light)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Language */}
        <Link
          href={pathname}
          locale={otherLocale}
          className="text-sm font-medium text-[var(--color-text-light)] hover:text-[var(--color-accent-dark)] px-3 py-1.5 transition-colors"
        >
          {otherLocale === 'ar' ? 'عربي' : 'EN'}
        </Link>

        {/* View Store + Copy link */}
        {storeUrl && (
          <div className="hidden sm:flex items-stretch border border-[var(--color-border)] rounded-lg overflow-hidden">
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-1.5 text-sm text-[var(--color-text-light)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-warm)] px-3 py-1.5 transition-colors"
              title={storeUrl}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <span>{t('viewStore')}</span>
            </a>
            <button
              onClick={copyStoreLink}
              className={`flex items-center justify-center w-9 border-s border-[var(--color-border)] transition-colors ${
                copied ? 'bg-[var(--color-bg-accent)] text-[var(--color-accent-dark)]' : 'text-[var(--color-text-light)] hover:bg-[var(--color-bg-warm)] hover:text-[var(--color-text)]'
              }`}
              title={locale === 'ar' ? 'نسخ رابط المتجر' : 'Copy store link'}
              aria-label="Copy link"
            >
              {copied ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Notifications */}
        <a
          href={`/${locale}/dashboard/notifications`}
          className="relative w-9 h-9 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-light)] hover:text-[var(--color-text)] transition-colors"
          aria-label="Notifications"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -end-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-error)] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </a>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 px-2 py-1 rounded-lg hover:bg-[var(--color-bg-warm)] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white flex items-center justify-center text-sm font-semibold">
              {initial}
            </div>
            <div className="hidden md:block text-start">
              <div className="text-sm font-medium text-[var(--color-text)] leading-tight">
                {user?.name}
              </div>
              <div className="text-[11px] text-[var(--color-text-muted)] leading-tight">
                {user?.store_name}
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-text-muted)] hidden md:block">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute end-0 mt-2 w-52 bg-white border border-[var(--color-border-light)] rounded-xl shadow-[0_10px_30px_rgba(5,46,43,0.12)] py-1 z-50">
              <a
                href={`/${locale}/dashboard/settings`}
                className="block px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg-warm)]"
              >
                {t('settings')}
              </a>
              <a
                href={`/${locale}/dashboard/subscription`}
                className="block px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg-warm)]"
              >
                {t('subscription')}
              </a>
              <div className="border-t border-[var(--color-border-light)] my-1" />
              <button
                onClick={handleLogout}
                className="w-full text-start px-4 py-2.5 text-sm text-[var(--color-error)] hover:bg-[var(--color-bg-warm)]"
              >
                {t('logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
