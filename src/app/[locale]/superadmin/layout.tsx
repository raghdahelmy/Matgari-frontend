import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import SuperAdminLayout from '@/components/superadmin/SuperAdminLayout';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.superadmin.meta' });
  return {
    title: t('title'),
    description: t('description'),
    robots: 'noindex, nofollow',
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SuperAdminLayout>{children}</SuperAdminLayout>;
}
