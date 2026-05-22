'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useLocale } from 'next-intl';
import Navbar from './Navbar';
import Footer from './Footer';
import AuthModal from './AuthModal';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const [authOpen, setAuthOpen] = useState(false);
  const [authForm, setAuthForm] = useState<'login' | 'register'>('login');

  const openAuth = (form: 'login' | 'register') => {
    setAuthForm(form);
    setAuthOpen(true);
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      openAuth(detail?.form || 'register');
    };
    window.addEventListener('open-auth', handler);
    return () => window.removeEventListener('open-auth', handler);
  }, []);

  return (
    <>
      <Navbar locale={locale} onOpenAuth={openAuth} />
      <main>{children}</main>
      <Footer />
      <AuthModal isOpen={authOpen} initialForm={authForm} onClose={() => setAuthOpen(false)} />
    </>
  );
}
