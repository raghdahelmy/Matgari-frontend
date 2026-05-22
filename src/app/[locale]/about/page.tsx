import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import MarketingLayout from '@/components/MarketingLayout';
import PageHero from '@/components/PageHero';
import RevealOnScroll from '@/components/RevealOnScroll';
import CTA from '@/components/CTA';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.about.meta' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

const valueIcons: Record<string, string> = {
  simplicity: 'M5 12h14M12 5l7 7-7 7',
  quality: 'M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z',
  support: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
  growth: 'M3 3v18h18M9 17V9M13 17v-6M17 17v-3',
};

const valueKeys = ['simplicity', 'quality', 'support', 'growth'] as const;

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.about' });

  return (
    <MarketingLayout>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
      />

      {/* Mission with image */}
      <section className="pb-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <RevealOnScroll>
            <div
              className="relative rounded-[24px] overflow-hidden h-[440px] mb-20 bg-[var(--color-bg-dark)]"
              style={{
                backgroundImage: "url('/images/about-hero.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Bottom dark gradient (vertical) for base readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#052E2B]/90 via-[#052E2B]/40 to-[#052E2B]/5" />

              {/* Side dark gradient (towards the start side where text lives) */}
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#052E2B]/20 to-[#052E2B]/70 rtl:bg-gradient-to-r rtl:from-[#052E2B]/70 rtl:via-[#052E2B]/20 rtl:to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex items-end px-10 md:px-16 py-12 z-10">
                <div
                  className="max-w-[620px]"
                  style={{ textShadow: '0 2px 12px rgba(0,0,0,0.45)' }}
                >
                  <span
                    className="inline-block text-[11px] tracking-[0.25em] uppercase text-white mb-5 border border-white/40 rounded-full px-4 py-1.5 backdrop-blur-md bg-white/10"
                    style={{ textShadow: 'none' }}
                  >
                    {t('mission.title')}
                  </span>
                  <p
                    className="text-white text-xl md:text-2xl leading-[1.8] font-light"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {t('mission.desc')}
                  </p>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Values */}
      <section className="pb-20 bg-[var(--color-bg-warm)] pt-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <RevealOnScroll className="text-center mb-12">
            <h2
              className="text-[clamp(2rem,3.5vw,2.8rem)] font-semibold text-[var(--color-text)] tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {t('values.title')}
            </h2>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valueKeys.map((key, i) => (
              <RevealOnScroll key={key} delay={i * 80}>
                <div className="bg-white border border-[var(--color-border-light)] rounded-[20px] p-8 h-full transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(5,46,43,0.08)]">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-bg-accent)] flex items-center justify-center text-[var(--color-accent-dark)] mb-5">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={valueIcons[key]} />
                    </svg>
                  </div>
                  <h3
                    className="text-lg font-semibold text-[var(--color-text)] mb-2"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {t(`values.items.${key}.title`)}
                  </h3>
                  <p className="text-sm text-[var(--color-text-light)] leading-relaxed">
                    {t(`values.items.${key}.desc`)}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-py">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <RevealOnScroll>
            <h2
              className="text-[clamp(2rem,3.5vw,2.8rem)] font-semibold text-[var(--color-text)] tracking-tight mb-5"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {t('team.title')}
            </h2>
            <p className="text-base leading-relaxed text-[var(--color-text-light)]">
              {t('team.desc')}
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <CTA />
    </MarketingLayout>
  );
}
