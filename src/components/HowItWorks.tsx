'use client';

import { useTranslations } from 'next-intl';
import RevealOnScroll from './RevealOnScroll';
import SectionHeader from './SectionHeader';

const stepKeys = ['register', 'activate', 'sell'] as const;

export default function HowItWorks() {
  const t = useTranslations('howItWorks');

  return (
    <section id="how-it-works" className="section-py bg-[var(--color-bg-warm)]">
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionHeader eyebrow={t('eyebrow')} title1={t('title1')} title2={t('title2')} />

        <div className="flex flex-col gap-10 max-w-[900px] mx-auto">
          {stepKeys.map((key, i) => (
            <RevealOnScroll key={key} delay={i * 120}>
              <div className="group grid grid-cols-1 md:grid-cols-[80px_1fr_200px] gap-8 items-center bg-[var(--color-bg-card)] p-10 rounded-[20px] border border-[var(--color-border-light)] transition-all duration-400 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(5,46,43,0.10)]">
                <div
                  className="text-5xl font-bold text-[var(--color-accent-light)] leading-none text-center md:text-start"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  0{i + 1}
                </div>
                <div>
                  <h3
                    className="text-xl font-semibold mb-2 text-[var(--color-text)]"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {t(`steps.${key}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--color-text-light)]">
                    {t(`steps.${key}.desc`)}
                  </p>
                </div>
                <div className="flex justify-center">
                  <StepIllustration step={key} />
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepIllustration({ step }: { step: string }) {
  if (step === 'register') {
    return (
      <div className="w-[140px] flex flex-col gap-2">
        <div className="h-3 bg-[var(--color-bg-accent)] rounded-sm w-full" />
        <div className="h-3 bg-[var(--color-bg-accent)] rounded-sm w-[60%]" />
        <div className="h-4 bg-[var(--color-accent)] rounded w-[50%] mt-1" />
      </div>
    );
  }
  if (step === 'activate') {
    return (
      <div className="w-20">
        <div className="w-0 h-0 border-x-[40px] border-x-transparent border-t-[25px] border-t-[var(--color-accent-light)]" />
        <div className="w-full h-[45px] bg-[var(--color-bg-accent)] rounded-b-md border-[1.5px] border-t-0 border-[var(--color-border)] flex items-center justify-center text-[var(--color-success)] text-xl font-bold">
          &#10003;
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-end gap-1.5 h-20 p-2 bg-[var(--color-bg-accent)] rounded-lg w-[140px]">
      {[40, 65, 50, 85, 70].map((h, i) => (
        <div key={i} className="flex-1 bg-[var(--color-accent)] rounded-t-sm" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}
