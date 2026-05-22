import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import LegalPage from '@/components/LegalPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.legal.terms.meta' });
  return { title: t('title'), description: t('description') };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.legal' });

  return (
    <LegalPage
      title={t('terms.title')}
      intro={t('terms.intro')}
      sections={t.raw('terms.sections') as { title: string; body: string }[]}
      lastUpdated={t('lastUpdated')}
    />
  );
}
