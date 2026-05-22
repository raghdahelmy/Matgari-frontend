'use client';

import { useTranslations } from 'next-intl';
import RevealOnScroll from './RevealOnScroll';

const heroImage = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80';

const products = [
  {
    img: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=400&q=80',
    name: 'Linen Blazer',
    price: '1,450',
  },
  {
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
    name: 'Suede Sneaker',
    price: '2,180',
  },
  {
    img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    name: 'Gold Ring',
    price: '890',
  },
];

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative min-h-screen flex items-center pt-40 pb-20 overflow-hidden">
      {/* BG Glow */}
      <div className="absolute -top-[200px] -end-[200px] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(0,168,120,0.14)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute -bottom-[300px] -start-[200px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(74,222,128,0.10)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-15 items-center">
        {/* Content */}
        <RevealOnScroll>
          <span className="inline-block text-xs font-medium tracking-[0.15em] uppercase text-[var(--color-accent-dark)] mb-5">
            {t('eyebrow')}
          </span>
          <h1
            className="text-[clamp(2.8rem,5vw,4.2rem)] font-semibold leading-[1.15] text-[var(--color-text)] mb-6 tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {t('title1')}
            <br />
            <em className="text-[var(--color-accent-dark)]">{t('title2')}</em>
          </h1>
          <p className="text-lg leading-relaxed text-[var(--color-text-light)] mb-9 max-w-[500px]">
            {t('subtitle')}
          </p>
          <div className="flex gap-4 mb-12 flex-wrap">
            <a href="#pricing" className="btn btn-primary btn-lg">{t('cta')}</a>
            <a href="#how-it-works" className="btn btn-ghost btn-lg">{t('ctaSecondary')}</a>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-4">
            <div className="flex">
              {['M', 'A', 'S', 'R'].map((letter, i) => (
                <div
                  key={letter}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white border-[2.5px] border-[var(--color-bg)] -ms-2 first:ms-0"
                  style={{
                    background: ['#00A878', '#00875A', '#16A34A', '#22C55E'][i],
                  }}
                >
                  {letter}
                </div>
              ))}
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              {t('proof', { count: '2,400' })}
            </p>
          </div>
        </RevealOnScroll>

        {/* Visual Mockup */}
        <RevealOnScroll delay={200} className="hidden lg:block">
          <div className="relative">
            {/* Browser Mockup */}
            <div className="bg-white rounded-[20px] shadow-[0_20px_60px_rgba(5,46,43,0.18)] overflow-hidden border border-[var(--color-border-light)]">
              {/* Browser Toolbar */}
              <div className="flex items-center gap-2 px-[18px] py-3.5 bg-[var(--color-bg-warm)] border-b border-[var(--color-border-light)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFD93D]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#6BCB77]" />
                <span className="ms-3 text-xs text-[var(--color-text-muted)] bg-white px-4 py-1.5 rounded-md flex-1 max-w-[240px] flex items-center gap-1.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  yourstore.matgari.com
                </span>
              </div>

              {/* Store Content */}
              <div className="bg-white">
                {/* Store Top Nav */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-border-light)]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00A878] to-[#00875A] flex items-center justify-center text-white text-[11px] font-bold">
                      L
                    </div>
                    <span className="text-[13px] font-semibold tracking-tight">LUMA</span>
                  </div>
                  <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
                    <span className="text-[11px] hidden xl:block">Shop</span>
                    <span className="text-[11px] hidden xl:block">Collections</span>
                    <span className="text-[11px] hidden xl:block">About</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    <div className="relative">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                      <span className="absolute -top-1.5 -end-1.5 w-3.5 h-3.5 bg-[var(--color-accent)] rounded-full text-white text-[8px] flex items-center justify-center font-bold">3</span>
                    </div>
                  </div>
                </div>

                {/* Hero Banner */}
                <div className="relative h-[140px] mx-5 mt-4 rounded-xl overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${heroImage})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                  <div className="relative z-10 h-full flex flex-col justify-center px-5">
                    <span className="text-[9px] tracking-[0.15em] uppercase text-white/80 mb-1">New Collection</span>
                    <h3 className="text-white text-base font-semibold leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Curated for<br />the modern soul
                    </h3>
                    <button className="mt-2 inline-flex items-center self-start gap-1 px-3 py-1 bg-white text-[10px] font-medium rounded-full text-[var(--color-text)]">
                      Shop now
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </div>

                {/* Section Title */}
                <div className="flex items-center justify-between px-5 mt-5 mb-3">
                  <span className="text-[11px] font-semibold text-[var(--color-text)]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Best Sellers
                  </span>
                  <span className="text-[9px] text-[var(--color-text-muted)]">View all →</span>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-3 gap-2.5 px-5 pb-5">
                  {products.map((product, i) => (
                    <div key={i} className="group cursor-pointer">
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-[var(--color-bg-warm)] mb-2">
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                          style={{ backgroundImage: `url(${product.img})` }}
                        />
                        <span className="absolute top-1.5 end-1.5 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                        </span>
                      </div>
                      <p className="text-[10px] font-medium text-[var(--color-text)] truncate">{product.name}</p>
                      <p className="text-[10px] text-[var(--color-accent-dark)] font-semibold">EGP {product.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute bottom-[40px] -start-[30px] flex items-center gap-3 bg-white px-5 py-3.5 rounded-xl shadow-[0_12px_40px_rgba(5,46,43,0.18)] border border-[var(--color-border-light)] animate-float z-10">
              <div className="w-10 h-10 rounded-full bg-[var(--color-success)] text-white flex items-center justify-center text-sm font-bold shrink-0">
                &#10003;
              </div>
              <div>
                <strong className="block text-sm text-[var(--color-text)]">New Order!</strong>
                <span className="text-xs text-[var(--color-text-muted)]">EGP 1,250.00</span>
              </div>
            </div>
            <div className="absolute top-[80px] -end-5 flex items-center gap-3 bg-white px-5 py-3.5 rounded-xl shadow-[0_12px_40px_rgba(5,46,43,0.18)] border border-[var(--color-border-light)] animate-float z-10" style={{ animationDelay: '2s' }}>
              <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-xs font-bold shrink-0">
                &#9650;
              </div>
              <div>
                <strong className="block text-sm text-[var(--color-text)]">+42%</strong>
                <span className="text-xs text-[var(--color-text-muted)]">Visitors this week</span>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
