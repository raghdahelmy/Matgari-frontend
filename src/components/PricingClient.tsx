'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import RevealOnScroll from './RevealOnScroll';
import SectionHeader from './SectionHeader';
import type { Plan } from '@/lib/api';

interface Labels {
  eyebrow: string;
  title1: string;
  title2: string;
  subtitle: string;
  monthly: string;
  yearly: string;
  save: string;
  perMonth: string;
  perYear: string;
  currency: string;
  getStarted: string;
  mostPopular: string;
  unlimited: string;
}

interface Props {
  plans: Plan[];
  labels: Labels;
  hideHeader?: boolean;
}

export default function PricingClient({ plans, labels, hideHeader = false }: Props) {
  const [isYearly, setIsYearly] = useState(false);
  const locale = useLocale();

  const handleSelectPlan = (slug: string) => {
    // Save intended plan
    if (typeof window !== 'undefined') {
      localStorage.setItem('intended_plan', slug);

      const token = localStorage.getItem('token');
      if (token) {
        // Already logged in → go straight to subscribe
        window.location.href = `/${locale}/subscribe?plan=${slug}`;
      } else {
        // Not logged in → open auth modal (PageShell/MarketingLayout listens)
        const event = new CustomEvent('open-auth', { detail: { form: 'register', plan: slug } });
        window.dispatchEvent(event);
      }
    }
  };

  // If no plans, show fallback
  if (!plans || plans.length === 0) {
    return (
      <section id="pricing" className={hideHeader ? 'pb-20' : 'section-py'}>
        <div className="max-w-[1200px] mx-auto px-6">
          {!hideHeader && (
            <SectionHeader
              eyebrow={labels.eyebrow}
              title1={labels.title1}
              title2={labels.title2}
              subtitle={labels.subtitle}
            />
          )}
          <p className="text-center text-[var(--color-text-muted)]">No plans available</p>
        </div>
      </section>
    );
  }

  // Compute average yearly discount for display
  const avgDiscount = Math.round(
    plans.reduce((acc, p) => acc + (p.pricing.yearly_discount || 0), 0) / plans.length
  );

  return (
    <section id="pricing" className={hideHeader ? 'pb-20' : 'section-py'}>
      <div className="max-w-[1200px] mx-auto px-6">
        {!hideHeader && (
          <SectionHeader
            eyebrow={labels.eyebrow}
            title1={labels.title1}
            title2={labels.title2}
            subtitle={labels.subtitle}
          />
        )}

        {/* Toggle */}
        <RevealOnScroll className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm transition-colors ${!isYearly ? 'text-[var(--color-text)] font-medium' : 'text-[var(--color-text-muted)]'}`}>
            {labels.monthly}
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`w-[52px] h-7 rounded-full border-none cursor-pointer relative transition-colors p-0 ${isYearly ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`}
            aria-label="Toggle billing cycle"
          >
            <span className={`absolute top-[3px] start-[3px] w-[22px] h-[22px] rounded-full bg-white shadow-sm transition-transform ${isYearly ? 'translate-x-6 rtl:-translate-x-6' : ''}`} />
          </button>
          <span className={`text-sm transition-colors ${isYearly ? 'text-[var(--color-text)] font-medium' : 'text-[var(--color-text-muted)]'}`}>
            {labels.yearly}{' '}
            {avgDiscount > 0 && (
              <span className="inline-block bg-[rgba(0,168,120,0.14)] text-[var(--color-accent-dark)] text-[0.72rem] font-semibold px-2 py-0.5 rounded-full ms-1">
                {labels.save.replace('20%', `${avgDiscount}%`)}
              </span>
            )}
          </span>
        </RevealOnScroll>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => {
            const isFeatured = plan.is_popular;
            const price = isYearly
              ? Math.round(parseFloat(plan.pricing.yearly_price))
              : Math.round(parseFloat(plan.pricing.monthly_price));

            return (
              <RevealOnScroll key={plan.id} delay={i * 100}>
                <div
                  className={`bg-[var(--color-bg-card)] border rounded-[28px] p-10 relative transition-all duration-400 hover:-translate-y-1.5 ${
                    isFeatured
                      ? 'border-[var(--color-accent)] shadow-[0_12px_40px_rgba(5,46,43,0.10)] lg:scale-[1.04] z-10 hover:shadow-[0_20px_60px_rgba(5,46,43,0.12)]'
                      : 'border-[var(--color-border-light)] hover:shadow-[0_12px_40px_rgba(5,46,43,0.10)]'
                  }`}
                >
                  {isFeatured && (
                    <div className="absolute -top-3.5 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 bg-[var(--color-bg-dark)] text-white text-xs font-semibold px-5 py-1.5 rounded-full tracking-wide">
                      {labels.mostPopular}
                    </div>
                  )}

                  <div className="mb-6">
                    <h3
                      className="text-2xl font-semibold text-[var(--color-text)] mb-1.5"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {plan.name}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)]">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1 mb-8 pb-6 border-b border-[var(--color-border-light)]">
                    <span
                      className="text-5xl font-bold text-[var(--color-text)] leading-none"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {price.toLocaleString()}
                    </span>
                    <span className="text-base font-medium text-[var(--color-text-light)] mx-0.5">
                      {labels.currency}
                    </span>
                    <span className="text-sm text-[var(--color-text-muted)]">
                      {isYearly ? labels.perYear : labels.perMonth}
                    </span>
                  </div>

                  <ul className="list-none mb-8 space-y-2">
                    {plan.features_list.slice(0, 8).map((feat, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 py-1.5 text-sm text-[var(--color-text-light)]"
                      >
                        <span className="text-[var(--color-success)] font-bold text-xs mt-0.5 shrink-0">
                          ✓
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(plan.slug)}
                    className={`btn w-full ${isFeatured ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {labels.getStarted}
                  </button>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
