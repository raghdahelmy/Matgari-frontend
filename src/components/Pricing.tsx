import { getPlans } from '@/lib/api';
import { getTranslations } from 'next-intl/server';
import PricingClient from './PricingClient';

export default async function Pricing({
  locale,
  hideHeader = false,
}: {
  locale: string;
  hideHeader?: boolean;
}) {
  const t = await getTranslations({ locale, namespace: 'pricing' });
  const plans = await getPlans(locale);

  return (
    <PricingClient
      plans={plans}
      hideHeader={hideHeader}
      labels={{
        eyebrow: t('eyebrow'),
        title1: t('title1'),
        title2: t('title2'),
        subtitle: t('subtitle'),
        monthly: t('monthly'),
        yearly: t('yearly'),
        save: t('save'),
        perMonth: t('perMonth'),
        perYear: t('perYear'),
        currency: t('currency'),
        getStarted: t('getStarted'),
        mostPopular: t('mostPopular'),
        unlimited: locale === 'ar' ? 'غير محدود' : 'Unlimited',
      }}
    />
  );
}
