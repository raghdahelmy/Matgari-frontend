'use client';

import { useTranslations } from 'next-intl';
import DemoBanner from './DemoBanner';
import DemoHeader from './DemoHeader';
import DemoHero from './DemoHero';
import DemoCategories from './DemoCategories';
import DemoFeatured from './DemoFeatured';
import DemoValues from './DemoValues';
import DemoNewsletter from './DemoNewsletter';
import DemoFooter from './DemoFooter';

export default function DemoStore({ locale }: { locale: string }) {
  const t = useTranslations('pages.demo');

  return (
    <div className="bg-white min-h-screen">
      <DemoBanner locale={locale} t={t} />
      <DemoHeader t={t} />
      <DemoHero t={t} />
      <DemoCategories t={t} />
      <DemoFeatured t={t} />
      <DemoValues t={t} />
      <DemoNewsletter t={t} />
      <DemoFooter t={t} locale={locale} />
    </div>
  );
}
