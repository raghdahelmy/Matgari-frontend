import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getStoreProduct, getStoreProducts } from '@/lib/storeApi';
import ProductDetailClient from '@/components/store/ProductDetailClient';
import ProductCard from '@/components/store/ProductCard';
import RevealOnScroll from '@/components/RevealOnScroll';

interface PageParams {
  params: Promise<{ locale: string; storeSlug: string; productSlug: string }>;
}

export async function generateMetadata({ params }: PageParams) {
  const { storeSlug, productSlug } = await params;
  const res = await getStoreProduct(storeSlug, productSlug);
  if (!res.status || !res.data) return { title: 'Product' };

  return {
    title: res.data.name,
    description: res.data.description?.slice(0, 160),
    openGraph: {
      title: res.data.name,
      description: res.data.description?.slice(0, 160),
      ...(res.data.image ? { images: [{ url: res.data.image }] } : {}),
    },
  };
}

export default async function ProductPage({ params }: PageParams) {
  const { locale, storeSlug, productSlug } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.store' });

  const res = await getStoreProduct(storeSlug, productSlug);
  if (!res.status || !res.data) {
    notFound();
  }

  const product = res.data;
  const base = `/${locale}/store/${storeSlug}`;

  // Related products (same category)
  const relatedRes = product.category
    ? await getStoreProducts(storeSlug, { category: product.category.slug })
    : null;
  const allRelated = relatedRes?.status
    ? (Array.isArray(relatedRes.data) ? relatedRes.data : (relatedRes.data as { data: typeof product[] })?.data ?? [])
    : [];
  const related = allRelated.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <>
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 pt-6">
        <nav className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] flex-wrap">
          <a href={base} className="hover:text-[var(--color-text)]">{t('nav.home')}</a>
          <span>›</span>
          <a href={`${base}/shop`} className="hover:text-[var(--color-text)]">{t('nav.shop')}</a>
          {product.category && (
            <>
              <span>›</span>
              <a href={`${base}/categories/${product.category.slug}`} className="hover:text-[var(--color-text)]">
                {product.category.name}
              </a>
            </>
          )}
          <span>›</span>
          <span className="text-[var(--color-text)] truncate">{product.name}</span>
        </nav>
      </div>

      {/* Main */}
      <section className="py-10">
        <ProductDetailClient product={product} storeSlug={storeSlug} />
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="py-16 bg-[var(--color-bg-warm)]/40 mt-8">
          <div className="max-w-[1400px] mx-auto px-6">
            <RevealOnScroll>
              <h2
                className="text-2xl md:text-3xl font-semibold text-[var(--color-text)] mb-8 tracking-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {t('product.related')}
              </h2>
            </RevealOnScroll>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {related.map((p, i) => (
                <RevealOnScroll key={p.id} delay={(i % 4) * 80}>
                  <ProductCard product={p} storeSlug={storeSlug} />
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
