'use client';

const heroImage = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=80';

export default function DemoHero({ t }: { t: (key: string) => string }) {
  return (
    <section className="relative h-[80vh] min-h-[560px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-transparent rtl:bg-gradient-to-l" />

      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-[1400px] mx-auto px-6 w-full">
          <div className="max-w-[640px]">
            <span className="inline-block text-xs tracking-[0.25em] uppercase text-white/80 mb-5 border-b border-white/40 pb-2">
              {t('hero.season')}
            </span>
            <h1
              className="text-white text-[clamp(2.8rem,6vw,5rem)] font-semibold leading-[1.05] mb-6 tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {t('hero.title')}
              <br />
              <em className="font-light">{t('hero.titleEm')}</em>
            </h1>
            <p className="text-white/90 text-lg leading-relaxed mb-8 max-w-[460px]">
              {t('hero.subtitle')}
            </p>
            <div className="flex gap-3 flex-wrap">
              <a
                href="#featured"
                className="bg-white text-[var(--color-text)] px-8 py-3.5 text-sm font-medium hover:bg-[var(--color-bg)] transition-all hover:shadow-2xl inline-flex items-center gap-2"
              >
                {t('hero.cta')}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="rtl:rotate-180">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="#featured"
                className="border border-white/40 text-white px-8 py-3.5 text-sm font-medium hover:bg-white/10 transition-all"
              >
                {t('hero.ctaSecondary')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
