'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

interface Props {
  locale: string;
  onNavigate?: () => void;
}

const navSections = [
  {
    title: null,
    items: [{ key: 'overview', href: '', icon: 'home' }],
  },
  {
    title: 'sales',
    items: [
      { key: 'orders', href: '/orders', icon: 'shopping-bag' },
      { key: 'customers', href: '/customers', icon: 'users' },
      { key: 'coupons', href: '/coupons', icon: 'tag' },
    ],
  },
  {
    title: 'catalog',
    items: [
      { key: 'products', href: '/products', icon: 'package' },
      { key: 'categories', href: '/categories', icon: 'folder' },
      { key: 'subCategories', href: '/subcategories', icon: 'folder' },
      { key: 'brands', href: '/brands', icon: 'star' },
    ],
  },
  {
    title: 'storefront',
    items: [
      { key: 'sliders', href: '/sliders', icon: 'image' },
      { key: 'pages', href: '/pages', icon: 'file' },
      { key: 'reviews', href: '/reviews', icon: 'message' },
    ],
  },
  {
    title: 'system',
    items: [
      { key: 'notifications', href: '/notifications', icon: 'bell' },
      { key: 'messages', href: '/messages', icon: 'mail' },
      { key: 'settings', href: '/settings', icon: 'settings' },
      { key: 'subscription', href: '/subscription', icon: 'credit-card' },
    ],
  },
];

const sectionLabelsAr: Record<string, string> = {
  sales: 'البيع',
  catalog: 'الكتالوج',
  storefront: 'واجهة المتجر',
  system: 'النظام',
};

const sectionLabelsEn: Record<string, string> = {
  sales: 'Sales',
  catalog: 'Catalog',
  storefront: 'Storefront',
  system: 'System',
};

export default function Sidebar({ locale, onNavigate }: Props) {
  const t = useTranslations('pages.dashboard.nav');
  const pathname = usePathname();
  const sectionLabels = locale === 'ar' ? sectionLabelsAr : sectionLabelsEn;

  const isActive = (href: string) => {
    const fullHref = `/${locale}/dashboard${href}`;
    if (href === '') return pathname === fullHref;
    return pathname.startsWith(fullHref);
  };

  return (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[var(--color-border-light)]">
        <a
          href={`/${locale}/dashboard`}
          className="text-2xl font-bold tracking-tight no-underline inline-block"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          <span className="text-[var(--color-text)]">Mat</span>
          <span className="text-[var(--color-accent)]">gari</span>
        </a>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] mt-1">
          {locale === 'ar' ? 'لوحة التاجر' : 'Vendor Dashboard'}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navSections.map((section, i) => (
          <div key={i} className="mb-5">
            {section.title && (
              <h3 className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-muted)] px-3 mb-2 font-semibold">
                {sectionLabels[section.title]}
              </h3>
            )}
            <ul className="space-y-0.5 list-none">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.key}>
                    <a
                      href={`/${locale}/dashboard${item.href}`}
                      onClick={onNavigate}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                        active
                          ? 'bg-[var(--color-bg-accent)] text-[var(--color-accent-dark)] font-medium'
                          : 'text-[var(--color-text-light)] hover:bg-[var(--color-bg-warm)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      <NavIcon name={item.icon} active={active} />
                      <span className="flex-1">{t(item.key)}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );
}

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? 'var(--color-accent-dark)' : 'currentColor';
  const strokeW = '1.6';
  const size = 18;

  const icons: Record<string, React.ReactNode> = {
    home: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    'shopping-bag': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
    users: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    tag: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
    package: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    folder: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
      </svg>
    ),
    star: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    image: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    file: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
      </svg>
    ),
    message: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    mail: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    settings: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
    bell: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
    'credit-card': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  };

  return <span className="shrink-0">{icons[name] ?? null}</span>;
}
