'use client';

import { useTranslations } from 'next-intl';
import RevealOnScroll from './RevealOnScroll';

export default function OurStory() {
  const t = useTranslations('story');

  return (
    <section id="story" className="section-py">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Content */}
          <RevealOnScroll>
            <span className="inline-block text-xs font-medium tracking-[0.15em] uppercase text-[var(--color-accent-dark)] mb-4">
              {t('eyebrow')}
            </span>
            <h2
              className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.2] text-[var(--color-text)] tracking-tight mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {t('title1')}
              <br />
              <em className="text-[var(--color-accent-dark)]">{t('title2')}</em>
            </h2>
            <p className="text-base leading-relaxed text-[var(--color-text-light)] mb-4">{t('p1')}</p>
            <p className="text-base leading-relaxed text-[var(--color-text-light)] mb-4">{t('p2')}</p>
            <p className="text-base leading-relaxed text-[var(--color-text-light)] mb-4">
              {t('p3_1')} <em className="text-[var(--color-text)] not-italic font-medium">&ldquo;{t('p3_2')}&rdquo;</em>
            </p>

            {/* Stats */}
            <div className="flex gap-10 mt-10 pt-8 border-t border-[var(--color-border-light)] flex-wrap">
              {[
                { number: '2,400+', label: t('stats.merchants') },
                { number: '180K+', label: t('stats.orders') },
                { number: '99.9%', label: t('stats.uptime') },
              ].map((stat) => (
                <div key={stat.label}>
                  <span className="block text-3xl font-bold text-[var(--color-text)] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {stat.number}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)] tracking-wide">{stat.label}</span>
                </div>
              ))}
            </div>
          </RevealOnScroll>

          {/* Image Grid */}
          <RevealOnScroll delay={200}>
            <div className="grid grid-cols-2 gap-4 grid-rows-[200px_200px]">
              <div
                className="row-span-2 rounded-[20px] overflow-hidden relative group cursor-pointer"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=600&q=80')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#052E2B]/80 via-[#052E2B]/20 to-transparent transition-opacity duration-500 group-hover:from-[#052E2B]/90" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 transition-transform duration-500 group-hover:translate-y-[-4px]">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-white/70 mb-1">01</span>
                  <span className="text-white text-xl font-medium" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {t('images.craftsmanship')}
                  </span>
                </div>
              </div>

              <div
                className="rounded-[20px] overflow-hidden relative group cursor-pointer"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=600&q=80')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#052E2B]/80 via-[#052E2B]/20 to-transparent transition-opacity duration-500 group-hover:from-[#052E2B]/90" />
                <div className="absolute inset-0 flex flex-col justify-end p-5 transition-transform duration-500 group-hover:translate-y-[-4px]">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-white/70 mb-1">02</span>
                  <span className="text-white text-lg font-medium" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {t('images.community')}
                  </span>
                </div>
              </div>

              <div
                className="rounded-[20px] overflow-hidden relative group cursor-pointer"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#052E2B]/80 via-[#052E2B]/20 to-transparent transition-opacity duration-500 group-hover:from-[#052E2B]/90" />
                <div className="absolute inset-0 flex flex-col justify-end p-5 transition-transform duration-500 group-hover:translate-y-[-4px]">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-white/70 mb-1">03</span>
                  <span className="text-white text-lg font-medium" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {t('images.growth')}
                  </span>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
