'use client';

import { useTranslations } from 'next-intl';
import RevealOnScroll from './RevealOnScroll';
import SectionHeader from './SectionHeader';

const testimonials = [
  {
    quote: 'I launched my handmade jewelry store in one afternoon. The dashboard is so intuitive, I didn\'t need to read a single tutorial.',
    quoteAr: 'أطلقت متجر المجوهرات اليدوية بتاعي في ضهرية واحدة. لوحة التحكم سهلة لدرجة إني محتجتش أقرا أي شرح.',
    name: 'Nour Ahmed',
    nameAr: 'نور أحمد',
    store: 'Nour Collection',
    initial: 'N',
    color: '#00A878',
  },
  {
    quote: 'The SEO tools alone are worth the subscription. My organic traffic tripled in two months without spending a penny on ads.',
    quoteAr: 'أدوات الـ SEO لوحدها تستاهل الاشتراك. الزيارات العضوية اتضاعفت 3 مرات في شهرين بدون ما أصرف جنيه على إعلانات.',
    name: 'Kareem Fathy',
    nameAr: 'كريم فتحي',
    store: 'Desert Rose',
    initial: 'K',
    color: '#00875A',
  },
  {
    quote: 'What I love most is the personal touch. When I had a question about my subscription, I got a real response within hours.',
    quoteAr: 'أكتر حاجة بحبها هي اللمسة الشخصية. لما كان عندي سؤال عن اشتراكي، جالي رد حقيقي في ساعات.',
    name: 'Sara Mansour',
    nameAr: 'سارة منصور',
    store: 'Silk & Stone',
    initial: 'S',
    color: '#16A34A',
  },
];

export default function Testimonials({ locale }: { locale: string }) {
  const t = useTranslations('testimonials');
  const isAr = locale === 'ar';

  return (
    <section className="section-py bg-[var(--color-bg-warm)]">
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionHeader eyebrow={t('eyebrow')} title1={t('title1')} title2={t('title2')} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item, i) => (
            <RevealOnScroll key={i} delay={i * 100}>
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-light)] rounded-[20px] p-9 transition-all duration-400 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(5,46,43,0.08)] h-full flex flex-col">
                <div className="text-[var(--color-accent)] text-base tracking-wider mb-5">
                  &#9733;&#9733;&#9733;&#9733;&#9733;
                </div>
                <blockquote className="text-sm leading-relaxed text-[var(--color-text-light)] mb-6 italic flex-1">
                  &ldquo;{isAr ? item.quoteAr : item.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div
                    className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
                    style={{ background: item.color }}
                  >
                    {item.initial}
                  </div>
                  <div>
                    <strong className="block text-sm text-[var(--color-text)]">
                      {isAr ? item.nameAr : item.name}
                    </strong>
                    <span className="text-xs text-[var(--color-text-muted)]">{item.store}</span>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
