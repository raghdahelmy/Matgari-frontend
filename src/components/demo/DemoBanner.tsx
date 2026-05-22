'use client';

interface Props {
  locale: string;
  t: (key: string) => string;
}

export default function DemoBanner({ locale, t }: Props) {
  return (
    <div className="bg-[var(--color-bg-dark)] text-white py-2.5">
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 text-sm">
          <span className="bg-[var(--color-accent)] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
            {t('banner.label')}
          </span>
          <span className="text-white/80 text-xs sm:text-sm">{t('banner.text')}</span>
        </div>
        <a
          href={`/${locale}/pricing`}
          className="text-xs font-medium text-white hover:text-[var(--color-accent-light)] transition-colors flex items-center gap-1.5 whitespace-nowrap"
        >
          {t('banner.cta')}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="rtl:rotate-180">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}
