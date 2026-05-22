'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

const items = [
  { key: 'overview', href: '', icon: 'home' },
  { key: 'tenants', href: '/tenants', icon: 'users' },
  { key: 'subscriptions', href: '/subscriptions', icon: 'credit-card' },
  { key: 'plans', href: '/plans', icon: 'layers' },
  { key: 'messages', href: '/messages', icon: 'mail' },
];

export default function SuperAdminSidebar({
  locale,
  onNavigate,
}: {
  locale: string;
  onNavigate?: () => void;
}) {
  const t = useTranslations('pages.superadmin.nav');
  const pathname = usePathname();

  const isActive = (href: string) => {
    const full = `/${locale}/superadmin${href}`;
    if (href === '') return pathname === full;
    return pathname.startsWith(full);
  };

  return (
    <>
      <div className="px-6 py-5 border-b border-[var(--color-border-light)]">
        <a
          href={`/${locale}`}
          className="text-2xl font-bold tracking-tight no-underline inline-block"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          <span className="text-[var(--color-text)]">Mat</span>
          <span className="text-[var(--color-accent)]">gari</span>
        </a>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-accent-dark)] mt-1 font-semibold">
          Super Admin
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-0.5 list-none">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.key}>
                <a
                  href={`/${locale}/superadmin${item.href}`}
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
      </nav>
    </>
  );
}

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? 'var(--color-accent-dark)' : 'currentColor';
  const props = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' as const, stroke, strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (name) {
    case 'home':
      return <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
    case 'users':
      return <svg {...props}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>;
    case 'credit-card':
      return <svg {...props}><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>;
    case 'layers':
      return <svg {...props}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>;
    case 'mail':
      return <svg {...props}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>;
    default:
      return null;
  }
}
