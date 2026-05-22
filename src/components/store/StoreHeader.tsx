'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getCart, type StoreSettings } from '@/lib/storeApi';
import StoreAuthModal from './StoreAuthModal';
import { useStoreAuth } from './useStoreAuth';

interface Props {
  storeSlug: string;
  locale: string;
  settings: StoreSettings | null;
}

export default function StoreHeader({ storeSlug, locale, settings }: Props) {
  const t = useTranslations('pages.store');
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, authed, logout } = useStoreAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!authed) {
      setCartCount(0);
      return;
    }
    getCart(storeSlug).then((res) => {
      if (res.status && res.data?.items) setCartCount(res.data.items.length);
    });
  }, [storeSlug, authed]);

  useEffect(() => {
    const onOpenAuth = (e: Event) => {
      const detail = (e as CustomEvent).detail as { mode?: 'login' | 'register' } | undefined;
      setAuthMode(detail?.mode || 'login');
      setAuthOpen(true);
    };
    window.addEventListener('open-store-auth', onOpenAuth);
    return () => window.removeEventListener('open-store-auth', onOpenAuth);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const storeName = settings?.store_name || storeSlug;
  const base = `/${locale}/store/${storeSlug}`;

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 bg-white ${
          scrolled ? 'shadow-[0_2px_12px_rgba(15,42,38,0.08)]' : 'border-b border-[var(--color-border-light)]'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 h-[72px] flex items-center justify-between gap-6">
          {/* Logo */}
          <a href={base} className="flex items-center gap-2.5 shrink-0">
            {settings?.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logo} alt={storeName} className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] flex items-center justify-center text-white font-bold">
                {storeName.charAt(0).toUpperCase()}
              </span>
            )}
            <span
              className="text-xl font-semibold tracking-tight text-[var(--color-text)] hidden sm:inline"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {storeName}
            </span>
          </a>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-7">
            <a href={base} className="text-sm text-[var(--color-text)] hover:text-[var(--color-accent-dark)] transition-colors">{t('nav.home')}</a>
            <a href={`${base}/shop`} className="text-sm text-[var(--color-text)] hover:text-[var(--color-accent-dark)] transition-colors">{t('nav.shop')}</a>
            <a href={`${base}/categories`} className="text-sm text-[var(--color-text)] hover:text-[var(--color-accent-dark)] transition-colors">{t('nav.categories')}</a>
            {settings?.store_phone && (
              <a href={`tel:${settings.store_phone}`} className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-text)]">{t('nav.contact')}</a>
            )}
          </nav>

          {/* Search (desktop) */}
          <form action={`${base}/shop`} className="hidden lg:flex flex-1 max-w-md relative">
            <input
              type="text"
              name="search"
              placeholder={t('searchPlaceholder')}
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border-light)] rounded-full px-5 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
            />
            <button type="submit" className="absolute end-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <a href={`${base}/shop`} className="lg:hidden w-10 h-10 rounded-full hover:bg-[var(--color-bg-warm)] flex items-center justify-center text-[var(--color-text)] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
            </a>

            <a href={`${base}/wishlist`} className="w-10 h-10 rounded-full hover:bg-[var(--color-bg-warm)] hidden sm:flex items-center justify-center text-[var(--color-text)] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </a>

            <a href={`${base}/cart`} className="relative w-10 h-10 rounded-full hover:bg-[var(--color-bg-warm)] flex items-center justify-center text-[var(--color-text)] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -end-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </a>

            {/* Auth */}
            {!authed ? (
              <button
                type="button"
                onClick={() => openAuth('login')}
                className="ms-1 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white text-sm font-medium transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                <span className="hidden sm:inline">{t('auth.signIn')}</span>
              </button>
            ) : (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="w-10 h-10 rounded-full bg-[var(--color-bg-accent)] hover:bg-[var(--color-bg-warm)] flex items-center justify-center text-[var(--color-accent-dark)] font-semibold transition-colors"
                  aria-label={t('auth.account')}
                >
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </button>
                {menuOpen && (
                  <div className="absolute end-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[var(--color-border-light)] py-2 z-50">
                    <div className="px-4 py-2 border-b border-[var(--color-border-light)]">
                      <p className="text-sm font-medium text-[var(--color-text)] truncate">{user?.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)] truncate">{user?.email}</p>
                    </div>
                    <a href={`${base}/profile`} className="block px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg-warm)]">
                      {t('auth.profile')}
                    </a>
                    <a href={`${base}/orders`} className="block px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg-warm)]">
                      {t('auth.myOrders')}
                    </a>
                    <a href={`${base}/wishlist`} className="block px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg-warm)]">
                      {t('auth.wishlist')}
                    </a>
                    <button
                      type="button"
                      onClick={() => { logout(); setMenuOpen(false); }}
                      className="w-full text-start px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      {t('auth.logout')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <StoreAuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}
