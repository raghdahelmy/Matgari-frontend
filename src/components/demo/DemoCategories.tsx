'use client';

import RevealOnScroll from '../RevealOnScroll';

const categories = [
  { key: 'clothing', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80' },
  { key: 'accessories', img: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=600&q=80' },
  { key: 'footwear', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80' },
  { key: 'beauty', img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80' },
  { key: 'home', img: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=600&q=80' },
] as const;

export default function DemoCategories({ t }: { t: (key: string) => string }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-6">
        <RevealOnScroll className="mb-10">
          <h2
            className="text-3xl md:text-4xl font-semibold text-[var(--color-text)] tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {t('categories.title')}
          </h2>
        </RevealOnScroll>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, i) => (
            <RevealOnScroll key={cat.key} delay={i * 70}>
              <a
                href="#"
                className="group block relative aspect-[3/4] overflow-hidden rounded-2xl"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${cat.img})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-end p-5">
                  <span
                    className="text-white text-lg md:text-xl font-medium tracking-wide"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {t(`categories.items.${cat.key}`)}
                  </span>
                </div>
              </a>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
