'use client';

import { useTranslations, useLocale } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('pages.notFound');
  const nav = useTranslations('nav');
  const locale = useLocale();

  const popularLinks = [
    { label: nav('features'), href: `/${locale}/features` },
    { label: nav('pricing'), href: `/${locale}/pricing` },
    { label: nav('story'), href: `/${locale}/about` },
    { label: locale === 'ar' ? 'معاينة المتجر' : 'Demo Store', href: `/${locale}/demo` },
  ];

  return (
    <main className="min-h-screen flex items-center justify-center py-20 px-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute -top-[150px] -end-[150px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(0,168,120,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute -bottom-[200px] -start-[150px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(74,222,128,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-[640px] mx-auto text-center">
        {/* 404 Code */}
        <div className="relative inline-block mb-6">
          <div
            className="text-[clamp(7rem,18vw,12rem)] font-bold leading-none tracking-tight"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              background: 'linear-gradient(135deg, #4ADE80 0%, #00A878 50%, #00875A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('code')}
          </div>
          {/* Floating badge */}
          <div className="absolute -top-2 -end-6 rotate-12 hidden sm:block">
            <span className="bg-[var(--color-bg-dark)] text-white text-[10px] font-semibold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full">
              {locale === 'ar' ? 'صفحة مفقودة' : 'Page lost'}
            </span>
          </div>
        </div>

        {/* Title & subtitle */}
        <h1
          className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-semibold text-[var(--color-text)] mb-4 leading-tight"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {t('title')}
        </h1>
        <p className="text-base md:text-lg text-[var(--color-text-light)] leading-relaxed mb-10 max-w-[480px] mx-auto">
          {t('subtitle')}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <a href={`/${locale}`} className="btn btn-primary btn-lg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="rtl:rotate-180">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {t('home')}
          </a>
          <a href={`/${locale}/contact`} className="btn btn-ghost btn-lg">
            {t('contact')}
          </a>
        </div>

        {/* Popular links */}
        <div className="pt-8 border-t border-[var(--color-border-light)] max-w-[460px] mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-4">
            {t('popular')}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 bg-white border border-[var(--color-border-light)] rounded-full text-sm text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-dark)] transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
