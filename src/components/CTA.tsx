'use client';

import { useTranslations } from 'next-intl';
import RevealOnScroll from './RevealOnScroll';

export default function CTA() {
  const t = useTranslations('cta');

  return (
    <section className="section-py">
      <div className="max-w-[1200px] mx-auto px-6">
        <RevealOnScroll>
          <div className="bg-[var(--color-bg-dark)] rounded-[28px] py-[clamp(48px,8vw,80px)] px-[clamp(32px,6vw,80px)] text-center">
            <h2
              className="text-[clamp(2rem,4vw,3rem)] font-semibold text-white mb-4"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {t('title')}
            </h2>
            <p className="text-base text-white/60 mb-8">{t('subtitle')}</p>
            <a
              href="#pricing"
              className="btn btn-lg !bg-[var(--color-accent)] !border-[var(--color-accent)] text-white hover:!bg-[var(--color-accent-light)] hover:!border-[var(--color-accent-light)]"
            >
              {t('btn')}
            </a>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
