import { getTranslations } from 'next-intl/server';
import {
  getStoreSliders,
  getStoreCategories,
  getStoreProducts,
  type StoreProduct,
} from '@/lib/storeApi';
import ProductCard from '@/components/store/ProductCard';
import RevealOnScroll from '@/components/RevealOnScroll';

export default async function StoreHomePage({
  params,
}: {
  params: Promise<{ locale: string; storeSlug: string }>;
}) {
  const { locale, storeSlug } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.store' });
  const base = `/${locale}/store/${storeSlug}`;

  const [slidersRes, categoriesRes, productsRes] = await Promise.all([
    getStoreSliders(storeSlug),
    getStoreCategories(storeSlug),
    getStoreProducts(storeSlug, { page: 1 }),
  ]);

  const sliders = slidersRes.status && Array.isArray(slidersRes.data) ? slidersRes.data : [];
  const categories = categoriesRes.status && Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
  const rawProducts = productsRes.status
    ? (Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data as { data: StoreProduct[] })?.data ?? [])
    : [];

  const featured = rawProducts.filter((p) => p.featured).slice(0, 8);
  const products = featured.length > 0 ? featured : rawProducts.slice(0, 8);

  // Pick first slider for hero, or fallback
  const hero = sliders[0];

  return (
    <>
      {/* Hero */}
      {hero ? (
        <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hero.image} alt={hero.title || ''} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent rtl:bg-gradient-to-l" />
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-[1400px] mx-auto px-6 w-full">
              <div className="max-w-[560px] text-white">
                {hero.title && (
                  <h1
                    className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.1] mb-4 tracking-tight"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {hero.title}
                  </h1>
                )}
                {hero.description && (
                  <p className="text-lg text-white/90 mb-7 leading-relaxed">{hero.description}</p>
                )}
                <a
                  href={hero.link || `${base}/shop`}
                  className="inline-flex items-center gap-2 bg-white text-[var(--color-text)] px-7 py-3.5 rounded-xl text-sm font-medium hover:bg-[var(--color-bg)] transition-all hover:shadow-xl"
                >
                  {t('home.explore')}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="rtl:rotate-180">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>
      ) : (
        // Fallback hero (no slider)
        <section className="bg-gradient-to-br from-[var(--color-bg-warm)] to-[var(--color-bg-accent)] py-24">
          <div className="max-w-[1400px] mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-semibold text-[var(--color-text)] mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {storeSlug}
            </h1>
            <a href={`${base}/shop`} className="inline-flex items-center gap-2 bg-[var(--color-bg-dark)] text-white px-7 py-3.5 rounded-xl text-sm font-medium">
              {t('home.explore')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="rtl:rotate-180">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16">
          <div className="max-w-[1400px] mx-auto px-6">
            <RevealOnScroll>
              <h2
                className="text-2xl md:text-3xl font-semibold text-[var(--color-text)] mb-8 tracking-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {t('home.shopByCategory')}
              </h2>
            </RevealOnScroll>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((cat, i) => (
                <RevealOnScroll key={cat.id} delay={i * 60}>
                  <a
                    href={`${base}/categories/${cat.slug}`}
                    className="group block relative aspect-square overflow-hidden rounded-2xl"
                  >
                    {cat.image ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)]" />
                    )}
                    <div className="absolute inset-0 flex items-end p-4">
                      <span className="text-white font-medium text-sm md:text-base" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        {cat.name}
                      </span>
                    </div>
                  </a>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured products */}
      {products.length > 0 && (
        <section className="py-16 bg-[var(--color-bg-warm)]/40">
          <div className="max-w-[1400px] mx-auto px-6">
            <RevealOnScroll className="flex items-end justify-between mb-8 gap-4 flex-wrap">
              <div>
                <h2
                  className="text-2xl md:text-3xl font-semibold text-[var(--color-text)] tracking-tight mb-1"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {t('home.featured')}
                </h2>
                <p className="text-sm text-[var(--color-text-light)]">{t('home.featuredSubtitle')}</p>
              </div>
              <a href={`${base}/shop`} className="text-sm text-[var(--color-accent-dark)] hover:text-[var(--color-accent)] font-medium">
                {t('home.viewAll')} →
              </a>
            </RevealOnScroll>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product, i) => (
                <RevealOnScroll key={product.id} delay={(i % 4) * 80}>
                  <ProductCard product={product} storeSlug={storeSlug} />
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {sliders.length === 0 && categories.length === 0 && products.length === 0 && (
        <div className="max-w-[600px] mx-auto px-6 py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-bg-accent)] mx-auto mb-4 flex items-center justify-center text-[var(--color-accent-dark)]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {locale === 'ar' ? 'لسه المتجر بيتجهز' : 'Store is being prepared'}
          </h2>
          <p className="text-sm text-[var(--color-text-light)]">
            {locale === 'ar' ? 'ارجع قريباً، التاجر بيضيف منتجاته' : 'Check back soon, products are being added'}
          </p>
        </div>
      )}
    </>
  );
}
