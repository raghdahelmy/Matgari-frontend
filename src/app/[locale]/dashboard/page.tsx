'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getDashboardOverview, type DashboardOverview } from '@/lib/tenantApi';
import { getStoredUser } from '@/lib/auth';
import { buildStoreUrl } from '@/lib/storeUrl';

export default function DashboardOverviewPage() {
  const t = useTranslations('pages.dashboard.overview');
  const tBase = useTranslations('pages.dashboard');
  const locale = useLocale();
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = getStoredUser();
  const userName = user?.name || '';
  const storeUrl = user?.store_name ? buildStoreUrl(user.store_name, locale) : null;

  useEffect(() => {
    getDashboardOverview().then((res) => {
      if (res.status) {
        setData(res.data);
      } else {
        setError(res.message);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <DashboardLoading text={tBase('loading')} />;

  if (error || !data) {
    const isFetchError = error?.toLowerCase().includes('fetch') || error?.toLowerCase().includes('network');
    const isNoSubscription = error?.toLowerCase().includes('subscription') || error?.toLowerCase().includes('اشتراك');
    return (
      <div className="space-y-5">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[var(--color-text)] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {t('welcome', { name: userName })}
          </h1>
          <p className="text-sm text-[var(--color-text-light)]">{t('subtitle')}</p>
        </div>

        {/* Store URL banner (always show) */}
        {storeUrl && (
          <div className="bg-gradient-to-r from-[var(--color-bg-accent)] to-[var(--color-bg-warm)] border border-[var(--color-border-light)] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-accent-dark)] mb-1 font-semibold">
                {locale === 'ar' ? 'رابط متجرك' : 'Your Store URL'}
              </p>
              <p className="text-sm font-mono text-[var(--color-text)] truncate" dir="ltr">{storeUrl}</p>
            </div>
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener"
              className="bg-[var(--color-bg-dark)] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[var(--color-text)] transition-colors inline-flex items-center gap-2 shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              {locale === 'ar' ? 'فتح المتجر' : 'Visit Store'}
            </a>
          </div>
        )}

        {/* Friendly error */}
        <div className="bg-white rounded-2xl border border-amber-200 bg-amber-50/30 p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {isNoSubscription
                  ? (locale === 'ar' ? 'محتاج تشترك الأول' : 'Subscription required')
                  : (locale === 'ar' ? 'تعذّر الاتصال بمتجرك' : "Couldn't reach your store")}
              </h3>
              {isNoSubscription ? (
                <div className="text-sm text-[var(--color-text-light)] space-y-3">
                  <p>
                    {locale === 'ar'
                      ? 'متجرك مش هيشتغل غير لما يكون عندك اشتراك مفعّل في باقة. اختار باقة دلوقتي وابدأ.'
                      : "Your store won't function until you have an active subscription. Pick a plan to get started."}
                  </p>
                  <div className="flex gap-2 pt-2">
                    <a href={`/${locale}/pricing`} className="btn btn-primary text-sm">
                      {locale === 'ar' ? 'تصفح الباقات' : 'Browse Plans'}
                    </a>
                    <a href={`/${locale}/dashboard/subscription`} className="btn btn-ghost text-sm">
                      {locale === 'ar' ? 'تفاصيل الاشتراك' : 'Subscription details'}
                    </a>
                  </div>
                </div>
              ) : isFetchError ? (
                <div className="text-sm text-[var(--color-text-light)] space-y-2">
                  <p>{locale === 'ar' ? 'الـ subdomain بتاع متجرك مش بيستجيب. ممكن يكون أحد الأسباب دي:' : "Your store's subdomain isn't responding. Possible reasons:"}</p>
                  <ul className="list-disc list-inside space-y-1 ms-2">
                    <li>
                      {locale === 'ar' ? 'الـ subdomain مش موجود في الـ ' : "The subdomain isn't in the "}
                      <code className="bg-[var(--color-bg-warm)] px-1.5 py-0.5 rounded text-xs">hosts</code>
                      {locale === 'ar' ? ' file — ضيفي السطر ده في ' : ' file — add this line to '}
                      <code className="bg-[var(--color-bg-warm)] px-1.5 py-0.5 rounded text-xs" dir="ltr">C:\Windows\System32\drivers\etc\hosts</code>
                      <pre className="bg-[var(--color-bg-dark)] text-white p-2 rounded mt-2 text-xs overflow-x-auto" dir="ltr">
{`127.0.0.1   ${user?.store_name}.api-matgary.test`}
                      </pre>
                    </li>
                    <li>{locale === 'ar' ? 'Laragon مش شغّال أو Apache متوقف' : 'Laragon is not running or Apache is stopped'}</li>
                    <li>{locale === 'ar' ? 'الاشتراك بتاعك لسه قيد المراجعة' : 'Your subscription is still pending approval'}</li>
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-[var(--color-text-light)]">{error}</p>
              )}
              {!isNoSubscription && (
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 btn btn-ghost text-sm inline-flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                  </svg>
                  {locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1
          className="text-2xl md:text-3xl font-semibold text-[var(--color-text)] mb-1"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {t('welcome', { name: userName })}
        </h1>
        <p className="text-sm text-[var(--color-text-light)]">{t('subtitle')}</p>
      </div>

      {/* Store URL banner */}
      {storeUrl && (
        <div className="bg-gradient-to-r from-[var(--color-bg-accent)] to-[var(--color-bg-warm)] border border-[var(--color-border-light)] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-accent-dark)] mb-1 font-semibold">
              {locale === 'ar' ? 'رابط متجرك' : 'Your Store URL'}
            </p>
            <p className="text-sm font-mono text-[var(--color-text)] truncate" dir="ltr">{storeUrl}</p>
          </div>
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener"
            className="bg-[var(--color-bg-dark)] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[var(--color-text)] transition-colors inline-flex items-center gap-2 shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            {locale === 'ar' ? 'فتح المتجر' : 'Visit Store'}
          </a>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label={t('stats.totalSales')}
          value={`${data.stats.total_sales?.toLocaleString() ?? 0} ${t('currency')}`}
          color="emerald"
          icon="trending-up"
        />
        <StatCard label={t('stats.totalOrders')} value={data.stats.total_orders} icon="shopping-bag" />
        <StatCard label={t('stats.totalProducts')} value={data.stats.total_products} icon="package" />
        <StatCard label={t('stats.totalCustomers')} value={data.stats.total_customers} icon="users" />
        <StatCard
          label={t('stats.pendingOrders')}
          value={data.stats.pending_orders}
          color={data.stats.pending_orders > 0 ? 'amber' : 'gray'}
          icon="clock"
        />
        <StatCard
          label={t('stats.lowStock')}
          value={data.stats.low_stock_count}
          color={data.stats.low_stock_count > 0 ? 'red' : 'gray'}
          icon="alert"
        />
      </div>

      {/* Sales chart */}
      {data.sales_chart && data.sales_chart.length > 0 && (
        <Card title={t('salesChart')}>
          <SalesChart data={data.sales_chart} />
        </Card>
      )}

      {/* Recent orders + Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('recentOrders')} viewAllHref={`/${locale}/dashboard/orders`} viewAllLabel={t('viewAll')}>
          {data.recent_orders.length === 0 ? (
            <EmptyState text={t('noOrders')} />
          ) : (
            <ul className="divide-y divide-[var(--color-border-light)]">
              {data.recent_orders.slice(0, 5).map((order) => (
                <li key={order.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">{order.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">#{order.order_number}</p>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {Number(order.total).toLocaleString()} {t('currency')}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title={t('topProducts')} viewAllHref={`/${locale}/dashboard/products`} viewAllLabel={t('viewAll')}>
          {!data.top_products || data.top_products.length === 0 ? (
            <EmptyState text={t('noProducts')} />
          ) : (
            <ul className="divide-y divide-[var(--color-border-light)]">
              {data.top_products.slice(0, 5).map((product, i) => (
                <li key={product.id} className="py-3 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[var(--color-bg-accent)] text-[var(--color-accent-dark)] flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">{product.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {product.sold} {locale === 'ar' ? 'طلب' : 'sold'}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[var(--color-accent-dark)] shrink-0">
                    {Number(product.revenue).toLocaleString()} {t('currency')}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Low stock */}
      {data.low_stock && data.low_stock.length > 0 && (
        <Card title={t('lowStockTitle')} viewAllHref={`/${locale}/dashboard/products`} viewAllLabel={t('viewAll')}>
          <ul className="divide-y divide-[var(--color-border-light)]">
            {data.low_stock.slice(0, 5).map((p) => (
              <li key={p.id} className="py-3 flex items-center justify-between">
                <span className="text-sm text-[var(--color-text)] truncate">{p.name}</span>
                <span className="text-xs font-bold text-[var(--color-error)] bg-red-50 px-2 py-1 rounded-full">
                  {p.stock} {locale === 'ar' ? 'متبقي' : 'left'}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

// ---------- Sub components ----------

function DashboardLoading({ text }: { text: string }) {
  return (
    <div className="space-y-6">
      <div className="h-12 w-64 bg-[var(--color-bg-warm)] rounded-lg animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 bg-[var(--color-bg-warm)] rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="h-64 bg-[var(--color-bg-warm)] rounded-xl animate-pulse" />
      <p className="text-center text-xs text-[var(--color-text-muted)]">{text}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  color = 'gray',
  icon,
}: {
  label: string;
  value: number | string;
  color?: 'emerald' | 'amber' | 'red' | 'gray';
  icon?: string;
}) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    emerald: { bg: 'bg-[var(--color-bg-accent)]', text: 'text-[var(--color-accent-dark)]' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700' },
    red: { bg: 'bg-red-50', text: 'text-red-700' },
    gray: { bg: 'bg-[var(--color-bg-warm)]', text: 'text-[var(--color-text-light)]' },
  };

  return (
    <div className="bg-white border border-[var(--color-border-light)] rounded-xl p-4 hover:shadow-[0_4px_20px_rgba(5,46,43,0.06)] transition-shadow">
      <div className={`w-9 h-9 rounded-lg ${colorMap[color].bg} ${colorMap[color].text} flex items-center justify-center mb-3`}>
        <StatIcon name={icon || 'home'} />
      </div>
      <p className="text-xs text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">{label}</p>
      <p
        className="text-xl md:text-2xl font-bold text-[var(--color-text)]"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {value ?? 0}
      </p>
    </div>
  );
}

function StatIcon({ name }: { name: string }) {
  const props = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'trending-up':
      return <svg {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
    case 'shopping-bag':
      return <svg {...props}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>;
    case 'package':
      return <svg {...props}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>;
    case 'users':
      return <svg {...props}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>;
    case 'clock':
      return <svg {...props}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
    case 'alert':
      return <svg {...props}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
    default:
      return null;
  }
}

function Card({
  title,
  viewAllHref,
  viewAllLabel,
  children,
}: {
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[var(--color-border-light)] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-base font-semibold text-[var(--color-text)]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {title}
        </h2>
        {viewAllHref && (
          <a href={viewAllHref} className="text-xs text-[var(--color-accent-dark)] hover:text-[var(--color-accent)]">
            {viewAllLabel} →
          </a>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-sm text-center text-[var(--color-text-muted)] py-8">{text}</p>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700' },
    processing: { bg: 'bg-blue-50', text: 'text-blue-700' },
    shipped: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
    delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700' },
  };
  const cls = map[status] || { bg: 'bg-gray-50', text: 'text-gray-600' };
  return (
    <span className={`inline-block ${cls.bg} ${cls.text} text-[10px] px-2 py-0.5 rounded-full mt-0.5`}>
      {status}
    </span>
  );
}

// ---------- Sales Chart (lightweight, no library) ----------
function SalesChart({ data }: { data: Array<{ date: string; total: number }> }) {
  const max = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="flex items-end gap-2 h-48 pt-4">
      {data.map((d, i) => {
        const height = (d.total / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex-1 flex items-end">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-[var(--color-accent-dark)] to-[var(--color-accent-light)] relative group cursor-pointer transition-all hover:opacity-80"
                style={{ height: `${Math.max(height, 4)}%` }}
              >
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[var(--color-bg-dark)] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {Number(d.total).toLocaleString()}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)]" dir="ltr">
              {d.date.slice(5)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
