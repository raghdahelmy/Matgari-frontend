'use client';

import RevealOnScroll from '../RevealOnScroll';

const bgImage = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1800&q=80';

export default function DemoNewsletter({ t }: { t: (key: string) => string }) {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }} />
      <div className="absolute inset-0 bg-[var(--color-bg-dark)]/80" />

      <div className="relative z-10 max-w-[640px] mx-auto px-6 text-center">
        <RevealOnScroll>
          <span className="inline-block text-xs font-medium tracking-[0.25em] uppercase text-[var(--color-accent-light)] mb-4">
            {t('newsletter.label')}
          </span>
          <h2
            className="text-white text-3xl md:text-4xl font-semibold tracking-tight mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {t('newsletter.title')}
          </h2>
          <p className="text-white/80 mb-8 leading-relaxed">{t('newsletter.desc')}</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              // demo only
            }}
            className="flex gap-2 max-w-[420px] mx-auto"
          >
            <input
              type="email"
              required
              placeholder={t('newsletter.placeholder')}
              className="flex-1 bg-white/10 border border-white/30 backdrop-blur-sm text-white placeholder-white/60 px-5 py-3.5 rounded-xl focus:outline-none focus:border-white/60 transition-colors"
              dir="ltr"
            />
            <button
              type="submit"
              className="bg-white text-[var(--color-text)] px-6 py-3.5 rounded-xl text-sm font-medium hover:bg-[var(--color-bg)] transition-colors whitespace-nowrap"
            >
              {t('newsletter.btn')}
            </button>
          </form>
        </RevealOnScroll>
      </div>
    </section>
  );
}
