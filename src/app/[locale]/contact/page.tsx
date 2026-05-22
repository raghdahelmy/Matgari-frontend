import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import MarketingLayout from '@/components/MarketingLayout';
import PageHero from '@/components/PageHero';
import ContactForm from '@/components/ContactForm';
import RevealOnScroll from '@/components/RevealOnScroll';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.contact.meta' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.contact' });

  return (
    <MarketingLayout>
      <PageHero eyebrow={t('hero.eyebrow')} title={t('hero.title')} />

      <section className="pb-24">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12">
            {/* Form */}
            <RevealOnScroll>
              <div className="bg-white border border-[var(--color-border-light)] rounded-[24px] p-10 shadow-[0_8px_32px_rgba(5,46,43,0.04)]">
                <ContactForm
                  labels={{
                    name: t('form.name'),
                    email: t('form.email'),
                    subject: t('form.subject'),
                    message: t('form.message'),
                    submit: t('form.submit'),
                    submitting: t('form.submitting'),
                    success: t('form.success'),
                    error: t('form.error'),
                  }}
                />
              </div>
            </RevealOnScroll>

            {/* Info */}
            <RevealOnScroll delay={150}>
              <div className="space-y-5">
                <InfoCard
                  icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
                  title={t('info.email')}
                  value="hello@matgari.com"
                />
                <InfoCard
                  icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>}
                  title={t('info.phone')}
                  value="+20 100 000 0000"
                />
                <InfoCard
                  icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                  title={t('info.hours')}
                  value={t('info.hoursValue')}
                />
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

function InfoCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="bg-[var(--color-bg-warm)] rounded-2xl p-6 flex items-start gap-4 transition-all hover:bg-white hover:shadow-[0_8px_24px_rgba(5,46,43,0.06)]">
      <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-[var(--color-accent-dark)] shrink-0 border border-[var(--color-border-light)]">
        {icon}
      </div>
      <div>
        <h4 className="text-sm text-[var(--color-text-muted)] mb-1">{title}</h4>
        <p className="text-base font-medium text-[var(--color-text)]" dir="ltr">
          {value}
        </p>
      </div>
    </div>
  );
}
