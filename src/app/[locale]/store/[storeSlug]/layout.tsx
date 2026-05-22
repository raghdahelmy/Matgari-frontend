import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getStoreSettings } from '@/lib/storeApi';
import { resolveTheme, themeCssVars, themeFontLink } from '@/lib/theme';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; storeSlug: string }>;
}): Promise<Metadata> {
  const { locale, storeSlug } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.store.meta' });

  const res = await getStoreSettings(storeSlug);
  const name = res.status && res.data?.store_name ? res.data.store_name : storeSlug;
  const description = res.data?.meta_description || t('description', { store: name });

  return {
    title: res.data?.meta_title || t('title', { store: name }),
    description,
    openGraph: {
      title: name,
      description,
      ...(res.data?.logo ? { images: [{ url: res.data.logo }] } : {}),
    },
  };
}

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; storeSlug: string }>;
}) {
  const { locale, storeSlug } = await params;
  const settingsRes = await getStoreSettings(storeSlug);
  const settings = settingsRes.status ? settingsRes.data : null;

  // Resolve theme from the store's settings (preset + font)
  const theme = resolveTheme((settings as Record<string, string | null | undefined>) || {});
  const fontLink = themeFontLink(theme);

  return (
    <>
      {fontLink && <link rel="stylesheet" href={fontLink} />}
      <style dangerouslySetInnerHTML={{ __html: themeCssVars(theme) }} />

      <div
        className="store-theme min-h-screen flex flex-col bg-white"
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
      >
        <StoreHeader storeSlug={storeSlug} locale={locale} settings={settings} />
        <main className="flex-1">{children}</main>
        <StoreFooter storeSlug={storeSlug} locale={locale} settings={settings} />
      </div>
    </>
  );
}
