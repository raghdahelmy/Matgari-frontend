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
  const t = await getTranslations({ locale, namespace: 'pages.features.meta' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

const sectionImages: Record<string, string> = {
  products: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=900&q=80',
  store: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=900&q=80',
  orders: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80',
  marketing: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
};

const sectionKeys = ['products', 'store', 'orders', 'marketing'] as const;

export default async function FeaturesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.features' });

  return (
    <MarketingLayout>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title1')}
        titleEm={t('hero.title2')}
        subtitle={t('hero.subtitle')}
      />

      {/* Feature Sections */}
      <div className="max-w-[1200px] mx-auto px-6 pb-20">
        {sectionKeys.map((key, i) => {
          const items = (t.raw(`sections.${key}.items`) as string[]) || [];
          const reverse = i % 2 === 1;

          return (
            <RevealOnScroll key={key} className="mb-24 last:mb-0">
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${reverse ? 'lg:[direction:rtl]' : ''}`}>
                {/* Content */}
                <div className={reverse ? 'lg:[direction:ltr] rtl:lg:[direction:rtl]' : ''}>
                  <span className="inline-block w-10 h-10 rounded-full bg-[var(--color-bg-accent)] text-[var(--color-accent-dark)] flex items-center justify-center font-semibold text-sm mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
                    0{i + 1}
                  </span>
                  <h2
                    className="text-[clamp(1.8rem,3vw,2.4rem)] font-semibold text-[var(--color-text)] mb-5 leading-tight"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {t(`sections.${key}.title`)}
                  </h2>
                  <p className="text-base leading-relaxed text-[var(--color-text-light)] mb-6">
                    {t(`sections.${key}.desc`)}
                  </p>
                  <ul className="space-y-2.5">
                    {items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-[var(--color-text)]">
                        <span className="mt-1 w-5 h-5 rounded-full bg-[var(--color-bg-accent)] text-[var(--color-accent-dark)] flex items-center justify-center text-[11px] font-bold shrink-0">
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Image */}
                <div className={reverse ? 'lg:[direction:ltr] rtl:lg:[direction:rtl]' : ''}>
                  <div
                    className="aspect-[4/3] rounded-[24px] overflow-hidden relative shadow-[0_20px_60px_rgba(5,46,43,0.15)] border border-[var(--color-border-light)]"
                    style={{
                      backgroundImage: `url(${sectionImages[key]})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#052E2B]/30 to-transparent" />
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          );
        })}
      </div>

      <CTA />
    </MarketingLayout>
  );
}
