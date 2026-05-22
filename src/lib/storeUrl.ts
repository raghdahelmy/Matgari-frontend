/**
 * Build the customer-facing storefront URL for a given store slug.
 *
 * - In development: uses the Next.js dev server with path-based routing
 *     localhost:3000/ar/store/eslam
 *
 * - In production: uses the subdomain (handled by middleware.ts)
 *     https://eslam.matgari.com
 *
 * Controlled by NEXT_PUBLIC_APP_HOST:
 *   - "localhost:3000"        → path-based (dev)
 *   - "matgari.com" (or any domain) → subdomain-based
 */

export function buildStoreUrl(storeSlug: string, locale: string = 'ar'): string {
  if (!storeSlug) return '';

  const appHost = process.env.NEXT_PUBLIC_APP_HOST || 'localhost:3000';
  const isLocalhost = appHost.startsWith('localhost') || appHost.startsWith('127.0.0.1');

  if (isLocalhost) {
    // Dev: path-based routing
    return `http://${appHost}/${locale}/store/${storeSlug}`;
  }

  // Production: subdomain (middleware rewrites to /store/[slug])
  const protocol = process.env.NEXT_PUBLIC_SITE_URL?.startsWith('http://') ? 'http' : 'https';
  return `${protocol}://${storeSlug}.${appHost}`;
}
