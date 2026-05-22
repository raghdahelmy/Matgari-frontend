'use client';

import { useTranslations, useLocale } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  const locale = useLocale();

  const productLinks = [
    { label: nav('features'), href: `/${locale}/features` },
    { label: nav('pricing'), href: `/${locale}/pricing` },
    { label: nav('howItWorks'), href: `/${locale}#how-it-works` },
    { label: locale === 'ar' ? 'معاينة المتجر' : 'Demo Store', href: `/${locale}/demo` },
  ];

  const companyLinks = [
    { label: nav('story'), href: `/${locale}/about` },
    { label: t('contact'), href: `/${locale}/contact` },
  ];

  const legalLinks = [
    { label: t('privacy'), href: `/${locale}/privacy` },
    { label: t('terms'), href: `/${locale}/terms` },
    { label: t('refund'), href: `/${locale}/refund` },
  ];

  return (
    <footer className="py-15 bg-[var(--color-bg-warm)] border-t border-[var(--color-border-light)]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <a
              href={`/${locale}`}
              className="text-2xl font-bold tracking-tight no-underline inline-block mb-4"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              <span className="text-[var(--color-text)]">Mat</span>
              <span className="text-[var(--color-accent)]">gari</span>
            </a>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-[280px]">
              {t('tagline')}
            </p>
          </div>

          <FooterColumn title={t('product')} links={productLinks} />
          <FooterColumn title={t('company')} links={companyLinks} />
          <FooterColumn title={t('legal')} links={legalLinks} />
        </div>

        <div className="pt-8 border-t border-[var(--color-border-light)] text-center">
          <p className="text-xs text-[var(--color-text-muted)]">&copy; 2026 {t('copy')}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4
        className="text-sm font-semibold mb-5 text-[var(--color-text)]"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {title}
      </h4>
      <ul className="list-none space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
