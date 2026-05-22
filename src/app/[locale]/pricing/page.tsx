import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import MarketingLayout from '@/components/MarketingLayout';
import PageHero from '@/components/PageHero';
import Pricing from '@/components/Pricing';
import CTA from '@/components/CTA';
import RevealOnScroll from '@/components/RevealOnScroll';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pricing' });
  return {
    title: `${t('title1')} ${t('title2')} — Matgari`,
    description: t('subtitle'),
  };
}

const faqs = {
  ar: [
    { q: 'هل في باقة مجانية؟', a: 'دلوقتي ما عندناش باقة مجانية، بس عندنا باقة بداية بأسعار في متناول الجميع. ممكن تجربها وتلغي في أي وقت.' },
    { q: 'إزاي بدفع؟', a: 'بنقبل التحويلات على المحفظة الإلكترونية وإنستاباي. ترفع الإيصال وفريقنا يفعّل المتجر في ساعات.' },
    { q: 'أقدر أغير الباقة بعدين؟', a: 'طبعاً، تقدر ترقي لباقة أعلى أو تنزل لأقل في أي وقت من إعدادات اشتراكك.' },
    { q: 'هل في عقد طويل؟', a: 'لا، الاشتراك شهري أو سنوي وقابل للإلغاء في أي وقت.' },
    { q: 'لو مفيش بيع، هتسترجعوا الفلوس؟', a: 'في فترة سماح للتجربة، لو واجهتك مشكلة تواصل معانا وفريقنا هيساعدك.' },
  ],
  en: [
    { q: 'Is there a free plan?', a: "We don't have a free plan currently, but we have an affordable starter plan you can try and cancel anytime." },
    { q: 'How do I pay?', a: 'We accept e-wallet transfers and InstaPay. Upload your receipt and our team activates the store within hours.' },
    { q: 'Can I change plans later?', a: 'Of course, you can upgrade or downgrade anytime from your subscription settings.' },
    { q: 'Is there a long contract?', a: 'No, subscriptions are monthly or yearly and cancellable anytime.' },
    { q: 'Refund policy?', a: 'There is a trial grace period. If you face an issue, contact us and our team will help.' },
  ],
};

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const items = isAr ? faqs.ar : faqs.en;

  return (
    <MarketingLayout>
      <PageHero
        eyebrow={isAr ? 'الباقات والأسعار' : 'Pricing & Plans'}
        title={isAr ? 'استثمر في تجارتك،' : 'Invest in your business,'}
        titleEm={isAr ? 'مش في حساب التكاليف' : 'not on counting costs'}
        subtitle={isAr ? 'أسعار واضحة وبدون أي رسوم خفية. ابدأ صغير، وكبّر على راحتك.' : 'Clear pricing with no hidden fees. Start small, grow at your pace.'}
      />

      <Pricing locale={locale} hideHeader />

      {/* FAQ */}
      <section className="section-py bg-[var(--color-bg-warm)]">
        <div className="max-w-[800px] mx-auto px-6">
          <RevealOnScroll className="text-center mb-12">
            <span className="inline-block text-xs font-medium tracking-[0.15em] uppercase text-[var(--color-accent-dark)] mb-4">
              {isAr ? 'أسئلة شائعة' : 'FAQ'}
            </span>
            <h2
              className="text-[clamp(1.8rem,3vw,2.4rem)] font-semibold text-[var(--color-text)] tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {isAr ? 'ممكن تكون عندك أسئلة' : 'You might have questions'}
            </h2>
          </RevealOnScroll>

          <div className="space-y-3">
            {items.map((faq, i) => (
              <RevealOnScroll key={i} delay={i * 60}>
                <details className="group bg-white border border-[var(--color-border-light)] rounded-2xl p-6 cursor-pointer transition-all hover:shadow-[0_4px_20px_rgba(5,46,43,0.06)]">
                  <summary className="flex items-center justify-between font-medium text-[var(--color-text)] text-base list-none [&::-webkit-details-marker]:hidden">
                    <span>{faq.q}</span>
                    <span className="text-[var(--color-accent)] transition-transform group-open:rotate-45 text-xl font-light shrink-0 ms-3">+</span>
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-light)]">
                    {faq.a}
                  </p>
                </details>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </MarketingLayout>
  );
}
