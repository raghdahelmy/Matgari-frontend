'use client';

import RevealOnScroll from '../RevealOnScroll';

interface Product {
  img: string;
  nameAr: string;
  nameEn: string;
  price: string;
  oldPrice: string | null;
  badge: 'new' | 'sale' | null;
}

const products: Product[] = [
  {
    img: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=800&q=80',
    nameAr: 'بليزر الكتان',
    nameEn: 'Linen Blazer',
    price: '1,450',
    oldPrice: null,
    badge: 'new',
  },
  {
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    nameAr: 'سنيكر سويد',
    nameEn: 'Suede Sneaker',
    price: '2,180',
    oldPrice: null,
    badge: null,
  },
  {
    img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    nameAr: 'خاتم ذهبي',
    nameEn: 'Gold Ring',
    price: '890',
    oldPrice: '1,200',
    badge: 'sale',
  },
  {
    img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
    nameAr: 'حقيبة جلدية',
    nameEn: 'Leather Bag',
    price: '3,250',
    oldPrice: null,
    badge: null,
  },
  {
    img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    nameAr: 'تيشرت قطن',
    nameEn: 'Cotton Tee',
    price: '450',
    oldPrice: null,
    badge: 'new',
  },
  {
    img: 'https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?auto=format&fit=crop&w=800&q=80',
    nameAr: 'نظارة شمسية',
    nameEn: 'Sunglasses',
    price: '1,100',
    oldPrice: null,
    badge: null,
  },
  {
    img: 'https://images.unsplash.com/photo-1581338834647-b0fb40704e21?auto=format&fit=crop&w=800&q=80',
    nameAr: 'كنزة صوف',
    nameEn: 'Wool Sweater',
    price: '1,650',
    oldPrice: '2,000',
    badge: 'sale',
  },
  {
    img: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=800&q=80',
    nameAr: 'ساعة أنيقة',
    nameEn: 'Elegant Watch',
    price: '4,800',
    oldPrice: null,
    badge: null,
  },
];

export default function DemoFeatured({ t }: { t: (key: string) => string }) {
  return (
    <section id="featured" className="py-20 bg-[var(--color-bg-warm)]">
      <div className="max-w-[1400px] mx-auto px-6">
        <RevealOnScroll className="text-center mb-12">
          <span className="inline-block text-xs font-medium tracking-[0.2em] uppercase text-[var(--color-accent-dark)] mb-4">
            {t('featured.label')}
          </span>
          <h2
            className="text-3xl md:text-4xl font-semibold text-[var(--color-text)] tracking-tight mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {t('featured.title')}
          </h2>
          <p className="text-[var(--color-text-light)] max-w-[480px] mx-auto">{t('featured.subtitle')}</p>
        </RevealOnScroll>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, i) => (
            <RevealOnScroll key={i} delay={(i % 4) * 80}>
              <ProductCard product={product} t={t} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({
  product,
  t,
}: {
  product: Product;
  t: (key: string) => string;
}) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-[4/5] overflow-hidden bg-white rounded-2xl mb-3">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${product.img})` }}
        />

        {/* Badge */}
        {product.badge && (
          <span
            className={`absolute top-3 start-3 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
              product.badge === 'new'
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-error)] text-white'
            }`}
          >
            {t(`product.${product.badge}`)}
          </span>
        )}

        {/* Wishlist */}
        <button
          className="absolute top-3 end-3 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-[var(--color-text)] hover:text-[var(--color-error)] transition-colors shadow-sm"
          aria-label="Wishlist"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>

        {/* Quick Add overlay */}
        <div className="absolute bottom-0 inset-x-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-400">
          <button className="w-full bg-[var(--color-bg-dark)] text-white text-sm font-medium py-3 rounded-xl hover:bg-[var(--color-text)] transition-colors flex items-center justify-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {t('product.addToCart')}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="px-1">
        <h3 className="text-sm font-medium text-[var(--color-text)] mb-1 truncate">
          {/* show Arabic name if RTL doc, else English */}
          <span className="rtl:hidden">{product.nameEn}</span>
          <span className="hidden rtl:inline">{product.nameAr}</span>
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-[var(--color-accent-dark)]">
            EGP {product.price}
          </span>
          {product.oldPrice && (
            <span className="text-xs text-[var(--color-text-muted)] line-through">
              EGP {product.oldPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
