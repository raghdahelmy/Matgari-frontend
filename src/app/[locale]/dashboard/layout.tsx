import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.dashboard.meta' });
  return {
    title: t('title'),
    description: t('description'),
    robots: 'noindex, nofollow',
  };
}

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
