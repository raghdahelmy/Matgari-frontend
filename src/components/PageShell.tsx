'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import HowItWorks from './HowItWorks';
import Testimonials from './Testimonials';
import OurStory from './OurStory';
import CTA from './CTA';
import Footer from './Footer';
import AuthModal from './AuthModal';

interface Props {
  pricing: ReactNode;
}

export default function PageShell({ pricing }: Props) {
  const locale = useLocale();
  const [authOpen, setAuthOpen] = useState(false);
  const [authForm, setAuthForm] = useState<'login' | 'register'>('login');

  const openAuth = (form: 'login' | 'register') => {
    setAuthForm(form);
    setAuthOpen(true);
  };

  // Listen for open-auth event from PricingClient
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
      <Hero />
      <BrandStrip />
      <Features />
      <HowItWorks />
      {pricing}
      <Testimonials locale={locale} />
      <OurStory />
      <CTA />
      <Footer />

      <AuthModal
        isOpen={authOpen}
        initialForm={authForm}
        onClose={() => setAuthOpen(false)}
      />
    </>
  );
}

function BrandStrip() {
  const t = useTranslations('brandStrip');
  const brands = ['Nour Collection', 'Beit El-Handmade', 'Silk & Stone', 'Desert Rose', 'Olive & Thread'];

  return (
    <section className="py-12 border-y border-[var(--color-border-light)]">
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="text-center text-xs tracking-[0.12em] uppercase text-[var(--color-text-muted)] mb-6">
          {t('label')}
        </p>
        <div className="flex justify-center items-center gap-12 flex-wrap">
          {brands.map((brand) => (
            <span
              key={brand}
              className="text-lg text-[var(--color-text-muted)] font-medium opacity-60 hover:opacity-100 transition-opacity cursor-default"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
