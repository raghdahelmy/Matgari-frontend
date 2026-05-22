import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import DemoStore from '@/components/demo/DemoStore';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.demo.meta' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function DemoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <DemoStore locale={locale} />;
}
