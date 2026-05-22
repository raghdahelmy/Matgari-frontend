'use client';

import { useTranslations } from 'next-intl';
import type { StoreSettings } from '@/lib/storeApi';

interface Props {
  storeSlug: string;
  locale: string;
  settings: StoreSettings | null;
}

export default function StoreFooter({ storeSlug, locale, settings }: Props) {
  const t = useTranslations('pages.store');
  const storeName = settings?.store_name || storeSlug;
  const base = `/${locale}/store/${storeSlug}`;

  return (
    <footer className="bg-[var(--color-bg-dark)] text-white pt-16 pb-8 mt-16">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              {settings?.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.logo} alt={storeName} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <span className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] flex items-center justify-center font-bold text-white">
                  {storeName.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="text-xl font-semibold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {storeName}
              </span>
            </div>
            <p className="text-sm text-white/60 max-w-[280px]">
              {settings?.meta_description || t('footer.tagline')}
            </p>
            {settings?.store_phone && (
              <p className="text-sm text-white/70 mt-3" dir="ltr">📞 {settings.store_phone}</p>
            )}
            {settings?.store_email && (
              <p className="text-sm text-white/70" dir="ltr">✉ {settings.store_email}</p>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2.5 list-none">
              <li><a href={base} className="text-sm text-white/70 hover:text-white">{t('nav.home')}</a></li>
              <li><a href={`${base}/shop`} className="text-sm text-white/70 hover:text-white">{t('nav.shop')}</a></li>
              <li><a href={`${base}/categories`} className="text-sm text-white/70 hover:text-white">{t('nav.categories')}</a></li>
              <li><a href={`${base}/cart`} className="text-sm text-white/70 hover:text-white">{t('cart')}</a></li>
            </ul>
          </div>

          {/* Address */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {t('nav.contact')}
            </h4>
            {settings?.store_address && (
              <p className="text-sm text-white/70 leading-relaxed mb-3">{settings.store_address}</p>
            )}
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {t('footer.follow')}
            </h4>
            <div className="flex gap-2">
              {settings?.facebook && (
                <SocialLink href={settings.facebook} name="facebook" />
              )}
              {settings?.instagram && (
                <SocialLink href={settings.instagram} name="instagram" />
              )}
              {settings?.twitter && (
                <SocialLink href={settings.twitter} name="twitter" />
              )}
              {settings?.whatsapp && (
                <SocialLink href={`https://wa.me/${settings.whatsapp.replace(/[^\d]/g, '')}`} name="whatsapp" />
              )}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-white/50">&copy; 2026 {storeName}.</p>
          <a href={`/${locale}`} className="text-xs text-white/50 hover:text-white/80 transition-colors">
            {t('footer.poweredBy')}{' '}
            <strong style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Mat<span className="text-[var(--color-accent-light)]">gari</span>
            </strong>
          </a>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, name }: { href: string; name: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="w-9 h-9 rounded-full border border-white/20 hover:bg-white hover:text-[var(--color-bg-dark)] flex items-center justify-center text-white transition-all"
      aria-label={name}
    >
      <SocialIcon name={name} />
    </a>
  );
}

function SocialIcon({ name }: { name: string }) {
  const props = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'currentColor' };
  if (name === 'instagram') {
    return (
      <svg {...props} fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" />
      </svg>
    );
  }
  if (name === 'facebook') {
    return (
      <svg {...props}>
        <path d="M22 12a10 10 0 10-11.55 9.88v-7H8v-2.88h2.45V9.65c0-2.4 1.45-3.74 3.6-3.74 1.04 0 2.13.18 2.13.18V8.5h-1.27c-1.25 0-1.66.78-1.66 1.58v1.92h2.86l-.46 2.88h-2.4v7A10 10 0 0022 12z" />
      </svg>
    );
  }
  if (name === 'whatsapp') {
    return (
      <svg {...props}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231z" />
    </svg>
  );
}
