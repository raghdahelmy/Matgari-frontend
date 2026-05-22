import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import MarketingLayout from '@/components/MarketingLayout';
import SubscribeClient from '@/components/SubscribeClient';
import { getPlans } from '@/lib/api';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.subscribe.meta' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function SubscribePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ plan?: string }>;
}) {
  const { locale } = await params;
  const { plan: planSlug } = await searchParams;

  const plans = await getPlans(locale);
  const initialPlan = planSlug ? plans.find((p) => p.slug === planSlug) ?? null : null;

  const t = await getTranslations({ locale, namespace: 'pages.subscribe' });

  return (
    <MarketingLayout>
      <SubscribeClient
        plans={plans}
        initialPlan={initialPlan}
        locale={locale}
        labels={{
          title: t('title'),
          subtitle: t('subtitle'),
          summary: {
            title: t('summary.title'),
            monthly: t('summary.monthly'),
            yearly: t('summary.yearly'),
            total: t('summary.total'),
            currency: t('summary.currency'),
          },
          billing: {
            title: t('billing.title'),
            monthly: t('billing.monthly'),
            yearly: t('billing.yearly'),
          },
          payment: {
            title: t('payment.title'),
            wallet: t('payment.wallet'),
            walletDesc: t('payment.walletDesc'),
            walletNumber: t('payment.walletNumber'),
            walletValue: t('payment.walletValue'),
            instapay: t('payment.instapay'),
            instapayDesc: t('payment.instapayDesc'),
            instapayHandle: t('payment.instapayHandle'),
            instapayValue: t('payment.instapayValue'),
            amount: t('payment.amount'),
          },
          receipt: {
            title: t('receipt.title'),
            desc: t('receipt.desc'),
            uploadBtn: t('receipt.uploadBtn'),
            selected: t('receipt.selected'),
            fileTypes: t('receipt.fileTypes'),
            tooLarge: t('receipt.tooLarge'),
            invalidType: t('receipt.invalidType'),
          },
          submit: t('submit'),
          submitting: t('submitting'),
          success: {
            title: t('success.title'),
            desc: t('success.desc'),
            btn: t('success.btn'),
          },
          errors: {
            noAuth: t('errors.noAuth'),
            noPlan: t('errors.noPlan'),
            noReceipt: t('errors.noReceipt'),
            submitFailed: t('errors.submitFailed'),
          },
          loginRequired: {
            title: t('loginRequired.title'),
            desc: t('loginRequired.desc'),
            login: t('loginRequired.login'),
            register: t('loginRequired.register'),
          },
        }}
      />
    </MarketingLayout>
  );
}
