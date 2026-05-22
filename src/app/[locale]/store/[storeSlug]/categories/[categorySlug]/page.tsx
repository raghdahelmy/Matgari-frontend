import { redirect } from 'next/navigation';

/**
 * Single category page → redirect to /shop?category={slug}
 * The shop page already supports filtering by category.
 */
export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ locale: string; storeSlug: string; categorySlug: string }>;
}) {
  const { locale, storeSlug, categorySlug } = await params;
  redirect(`/${locale}/store/${storeSlug}/shop?category=${encodeURIComponent(categorySlug)}`);
}
