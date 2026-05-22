'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { isAuthenticated, getStoredUser } from '@/lib/auth';

interface NavbarProps {
  locale: string;
  onOpenAuth: (form: 'login' | 'register') => void;
}

export default function Navbar({ locale, onOpenAuth }: NavbarProps) {
  const t = useTranslations('nav');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authedRole, setAuthedRole] = useState<string | null>(null);
  const pathname = usePathname();
  const otherLocale = locale === 'ar' ? 'en' : 'ar';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sync = () => {
      if (isAuthenticated()) {
        const u = getStoredUser();
        setAuthedRole(u?.role || 'user');
      } else {
        setAuthedRole(null);
      }
    };
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('store-auth-changed', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('store-auth-changed', sync);
    };
  }, []);

  // Only vendors and admins have a dashboard. Customers (role='user') stay on the marketing site as guests.
  const hasDashboard = authedRole === 'vendor' || authedRole === 'super_admin' || authedRole === 'admin';
  const dashboardHref =
    authedRole === 'super_admin' || authedRole === 'admin'
      ? `/${locale}/superadmin`
      : `/${locale}/dashboard`;
  const logoHref = hasDashboard ? dashboardHref : `/${locale}`;

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-400 ${
          scrolled
            ? 'bg-[var(--color-bg)]/95 backdrop-blur-xl py-3.5 shadow-[0_1px_0_var(--color-border-light)]'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <a href={logoHref} className="font-[var(--font-heading)] text-[1.7rem] font-bold tracking-tight no-underline" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            <span className="text-[var(--color-text)]">Mat</span>
            <span className="text-[var(--color-accent)]">gari</span>
          </a>

          {/* Desktop Links */}
          <ul className="hidden md:flex items-center gap-9 list-none">
            {[
              { key: 'features', href: `/${locale}/features` },
              { key: 'pricing', href: `/${locale}/pricing` },
              { key: 'story', href: `/${locale}/about` },
            ].map((item) => (
              <li key={item.key}>
                <a
                  href={item.href}
                  className="text-[0.95rem] text-[var(--color-text-light)] hover:text-[var(--color-text)] relative transition-colors after:content-[''] after:absolute after:bottom-[-4px] after:start-0 after:w-0 after:h-[1.5px] after:bg-[var(--color-accent)] after:transition-all hover:after:w-full"
                >
                  {t(item.key)}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`/${locale}/demo`}
                className="text-[0.95rem] text-[var(--color-text-light)] hover:text-[var(--color-text)] relative transition-colors after:content-[''] after:absolute after:bottom-[-4px] after:start-0 after:w-0 after:h-[1.5px] after:bg-[var(--color-accent)] after:transition-all hover:after:w-full"
              >
                {locale === 'ar' ? 'معاينة' : 'Demo'}
              </a>
            </li>
            <li>
              <a
                href={`/${locale}/contact`}
                className="text-[0.95rem] text-[var(--color-text-light)] hover:text-[var(--color-text)] relative transition-colors after:content-[''] after:absolute after:bottom-[-4px] after:start-0 after:w-0 after:h-[1.5px] after:bg-[var(--color-accent)] after:transition-all hover:after:w-full"
              >
                {locale === 'ar' ? 'تواصل' : 'Contact'}
              </a>
            </li>
            {/* Language Switcher */}
            <li>
              <Link
                href={pathname}
                locale={otherLocale}
                className="text-[0.95rem] font-medium text-[var(--color-accent-dark)] hover:text-[var(--color-accent)] transition-colors"
              >
                {otherLocale === 'ar' ? 'عربي' : 'EN'}
              </Link>
            </li>
          </ul>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {hasDashboard ? (
              <a href={dashboardHref} className="btn btn-primary !py-2.5 !px-6 !text-[0.9rem]">
                {locale === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
              </a>
            ) : (
              <>
                <a href={`/${locale}/pricing`} className="btn btn-ghost !py-2.5 !px-6 !text-[0.9rem]">
                  {t('startFree')}
                </a>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="btn btn-primary !py-2.5 !px-6 !text-[0.9rem]"
                >
                  {t('signIn')}
                </button>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col gap-[5px] p-1 bg-transparent border-none cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-[22px] h-[1.5px] bg-[var(--color-text)] transition-transform origin-center ${mobileOpen ? 'rotate-45 translate-y-[3.25px]' : ''}`} />
            <span className={`block w-[22px] h-[1.5px] bg-[var(--color-text)] transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-[22px] h-[1.5px] bg-[var(--color-text)] transition-transform origin-center ${mobileOpen ? '-rotate-45 -translate-y-[3.25px]' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-[var(--color-bg)] z-40 flex flex-col items-center justify-center transition-opacity md:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <ul className="list-none text-center mb-10 space-y-5">
          {[
            { key: 'features', href: `/${locale}/features` },
            { key: 'pricing', href: `/${locale}/pricing` },
            { key: 'story', href: `/${locale}/about` },
          ].map((item) => (
            <li key={item.key}>
              <a
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-3xl text-[var(--color-text)] no-underline"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {t(item.key)}
              </a>
            </li>
          ))}
          <li>
            <a
              href={`/${locale}/demo`}
              onClick={() => setMobileOpen(false)}
              className="text-3xl text-[var(--color-text)] no-underline"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {locale === 'ar' ? 'معاينة' : 'Demo'}
            </a>
          </li>
          <li>
            <a
              href={`/${locale}/contact`}
              onClick={() => setMobileOpen(false)}
              className="text-3xl text-[var(--color-text)] no-underline"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {locale === 'ar' ? 'تواصل' : 'Contact'}
            </a>
          </li>
          <li>
            <Link
              href={pathname}
              locale={otherLocale}
              className="text-xl font-medium text-[var(--color-accent-dark)]"
            >
              {otherLocale === 'ar' ? 'عربي' : 'English'}
            </Link>
          </li>
        </ul>
        <div className="flex flex-col gap-3 w-full max-w-[300px]">
          {hasDashboard ? (
            <a
              href={dashboardHref}
              onClick={() => setMobileOpen(false)}
              className="btn btn-primary w-full text-center"
            >
              {locale === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
            </a>
          ) : (
            <>
              <button onClick={() => { onOpenAuth('register'); setMobileOpen(false); }} className="btn btn-primary w-full">
                {t('startFree')}
              </button>
              <button onClick={() => { onOpenAuth('login'); setMobileOpen(false); }} className="btn btn-ghost w-full">
                {t('signIn')}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
