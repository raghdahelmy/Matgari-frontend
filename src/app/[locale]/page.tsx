import PageShell from '@/components/PageShell';
import Pricing from '@/components/Pricing';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <PageShell pricing={<Pricing locale={locale} />} />;
}
