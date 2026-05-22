import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/**
 * Hosts that are NOT tenant subdomains — the main marketing/dashboard site.
 * Anything else with a subdomain is treated as a store.
 *
 * In production this would be e.g. ['matgari.com', 'www.matgari.com'].
 * In development we use APP_HOST or fall back to localhost.
 */
const APP_HOST = process.env.NEXT_PUBLIC_APP_HOST || 'localhost:3000';
const RESERVED_SUBDOMAINS = new Set(['www', 'api', 'admin', 'app']);

/**
 * Detect a tenant subdomain like `eslam.matgari.com` and rewrite to
 * `/{locale}/store/eslam/...` so the storefront layout takes over.
 */
function detectStoreSubdomain(req: NextRequest): string | null {
  const host = req.headers.get('host') || '';
  // Strip port for comparison
  const hostNoPort = host.split(':')[0];
  const appNoPort = APP_HOST.split(':')[0];

  // If host equals the main app host, no tenant
  if (hostNoPort === appNoPort) return null;

  // Same root domain? e.g. eslam.matgari.com matches matgari.com
  if (!hostNoPort.endsWith(`.${appNoPort}`)) return null;

  // Extract subdomain part
  const sub = hostNoPort.slice(0, hostNoPort.length - appNoPort.length - 1);

  // Ignore reserved subdomains
  if (!sub || RESERVED_SUBDOMAINS.has(sub)) return null;

  return sub;
}

export default function middleware(req: NextRequest) {
  const storeSlug = detectStoreSubdomain(req);

  if (storeSlug) {
    const { pathname, search } = req.nextUrl;

    // Already rewritten? skip
    if (pathname.startsWith('/ar/store/') || pathname.startsWith('/en/store/')) {
      return intlMiddleware(req);
    }

    // Extract existing locale from path if present, default to ar
    let locale: 'ar' | 'en' = 'ar';
    let rest = pathname;
    if (pathname.startsWith('/ar') || pathname.startsWith('/en')) {
      locale = pathname.startsWith('/en') ? 'en' : 'ar';
      rest = pathname.slice(3) || '/';
    }

    const newUrl = req.nextUrl.clone();
    newUrl.pathname = `/${locale}/store/${storeSlug}${rest === '/' ? '' : rest}`;
    newUrl.search = search;
    return NextResponse.rewrite(newUrl);
  }

  // Fall through to next-intl
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    // Skip API, Next internals, and static files
    '/((?!api|_next|images|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\..*).*)',
  ],
};
