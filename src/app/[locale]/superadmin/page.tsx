'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  getTenantStats,
  getSubscriptionsStats,
  getTenants,
  getAdminSubscriptions,
  getMarketingUnreadCount,
  type TenantStats,
  type SubscriptionStats,
  type Vendor,
  type AdminSubscription,
} from '@/lib/adminApi';
import { getStoredUser } from '@/lib/auth';

export default function SuperAdminOverviewPage() {
  const t = useTranslations('pages.superadmin.overview');
  const tBase = useTranslations('pages.dashboard');
  const locale = useLocale();
  const user = getStoredUser();

  const [tenantStats, setTenantStats] = useState<TenantStats | null>(null);
  const [subStats, setSubStats] = useState<SubscriptionStats | null>(null);
  const [recentVendors, setRecentVendors] = useState<Vendor[]>([]);
  const [pendingSubs, setPendingSubs] = useState<AdminSubscription[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getTenantStats(),
      getSubscriptionsStats(),
      getTenants(),
      getAdminSubscriptions({ status: 'pending' }),
      getMarketingUnreadCount(),
    ]).then(([statsRes, subStatsRes, vendorsRes, pendingRes, msgRes]) => {
      if (statsRes.status) setTenantStats(statsRes.data);
      if (subStatsRes.status) setSubStats(subStatsRes.data);
      if (vendorsRes.status && Array.isArray(vendorsRes.data)) setRecentVendors(vendorsRes.data.slice(0, 5));
      if (pendingRes.status && Array.isArray(pendingRes.data)) setPendingSubs(pendingRes.data.slice(0, 5));
      if (msgRes.status && msgRes.data) setUnreadMessages(msgRes.data.count);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-[var(--color-bg-warm)] rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-[var(--color-bg-warm)] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-[var(--color-text)] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {t('welcome', { name: user?.name || '' })}
        </h1>
        <p className="text-sm text-[var(--color-text-light)]">{t('subtitle')}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('stats.totalStores')}
          value={tenantStats?.total ?? 0}
          icon="store"
          color="emerald"
        />
        <StatCard
          label={t('stats.activeStores')}
          value={tenantStats?.active_stores ?? 0}
          icon="check"
          color="emerald"
        />
        <StatCard
          label={t('stats.pendingVendors')}
          value={tenantStats?.pending ?? 0}
          icon="clock"
          color={(tenantStats?.pending ?? 0) > 0 ? 'amber' : 'gray'}
        />
        <StatCard
          label={t('stats.awaitingPayment')}
          value={tenantStats?.awaiting_payment ?? 0}
          icon="clock"
          color={(tenantStats?.awaiting_payment ?? 0) > 0 ? 'amber' : 'gray'}
        />
        <StatCard
          label={t('stats.suspendedStores')}
          value={tenantStats?.suspended_stores ?? 0}
          icon="ban"
          color={(tenantStats?.suspended_stores ?? 0) > 0 ? 'red' : 'gray'}
        />
        <StatCard
          label={t('stats.totalSubscriptions')}
          value={subStats?.total ?? 0}
          icon="credit-card"
        />
        <StatCard
          label={tBase('overview.stats.pendingOrders').replace('طلبات', 'اشتراكات').replace('orders', 'subs')}
          value={subStats?.pending ?? 0}
          icon="clock"
          color={(subStats?.pending ?? 0) > 0 ? 'amber' : 'gray'}
        />
        <StatCard
          label={t('stats.monthlyRevenue')}
          value={`${Number(subStats?.total_revenue ?? 0).toLocaleString()} ج.م`}
          icon="chart"
          color="emerald"
        />
        <StatCard
          label={t('stats.unreadMessages')}
          value={unreadMessages}
          icon="mail"
          color={unreadMessages > 0 ? 'amber' : 'gray'}
        />
      </div>

      {/* Pending subscriptions */}
      <Card title={t('pendingSubscriptions')} viewAllHref={`/${locale}/superadmin/subscriptions?status=pending`} viewAllLabel={t('viewAll')}>
        {pendingSubs.length === 0 ? (
          <p className="text-sm text-center text-[var(--color-text-muted)] py-8">{t('noPending')}</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border-light)]">
            {pendingSubs.map((sub) => (
              <li key={sub.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">{sub.user?.name || '—'}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {sub.plan?.name} · {sub.billing_cycle === 'monthly' ? 'شهري' : 'سنوي'}
                  </p>
                </div>
                <div className="text-end shrink-0">
                  <p className="text-sm font-bold text-[var(--color-accent-dark)]">
                    {Number(sub.amount).toLocaleString()} {sub.currency}
                  </p>
                  <a href={`/${locale}/superadmin/subscriptions`} className="text-xs text-[var(--color-accent-dark)] hover:underline">
                    عرض →
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Recent vendors */}
      <Card title={t('recentVendors')} viewAllHref={`/${locale}/superadmin/tenants`} viewAllLabel={t('viewAll')}>
        {recentVendors.length === 0 ? (
          <p className="text-sm text-center text-[var(--color-text-muted)] py-8">—</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border-light)]">
            {recentVendors.map((v) => (
              <li key={v.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                    {v.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">{v.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">{v.email}</p>
                  </div>
                </div>
                <VendorStatusBadge status={v.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color = 'gray',
}: {
  label: string;
  value: number | string;
  icon: string;
  color?: 'emerald' | 'amber' | 'red' | 'gray';
}) {
  const colorMap = {
    emerald: { bg: 'bg-[var(--color-bg-accent)]', text: 'text-[var(--color-accent-dark)]' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700' },
    red: { bg: 'bg-red-50', text: 'text-red-700' },
    gray: { bg: 'bg-[var(--color-bg-warm)]', text: 'text-[var(--color-text-light)]' },
  };
  return (
    <div className="bg-white border border-[var(--color-border-light)] rounded-xl p-4">
      <div className={`w-9 h-9 rounded-lg ${colorMap[color].bg} ${colorMap[color].text} flex items-center justify-center mb-3`}>
        <Icon name={icon} />
      </div>
      <p className="text-xs text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">{label}</p>
      <p className="text-xl md:text-2xl font-bold text-[var(--color-text)]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        {value}
      </p>
    </div>
  );
}

function Icon({ name }: { name: string }) {
  const props = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none' as const, stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'store':
      return <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
    case 'check':
      return <svg {...props}><polyline points="20 6 9 17 4 12" /></svg>;
    case 'clock':
      return <svg {...props}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
    case 'ban':
      return <svg {...props}><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>;
    case 'credit-card':
      return <svg {...props}><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>;
    case 'chart':
      return <svg {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
    case 'mail':
      return <svg {...props}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>;
    default:
      return null;
  }
}

function Card({ title, children, viewAllHref, viewAllLabel }: { title: string; children: React.ReactNode; viewAllHref?: string; viewAllLabel?: string }) {
  return (
    <div className="bg-white border border-[var(--color-border-light)] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-[var(--color-text)]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {title}
        </h2>
        {viewAllHref && (
          <a href={viewAllHref} className="text-xs text-[var(--color-accent-dark)] hover:underline">
            {viewAllLabel} →
          </a>
        )}
      </div>
      {children}
    </div>
  );
}

function VendorStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700',
    approved: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-red-50 text-red-700',
    cancelled: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`inline-block ${map[status] || map.cancelled} text-[10px] font-medium px-2 py-0.5 rounded-full`}>
      {status}
    </span>
  );
}
