'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getVendorOrders, type Order } from '@/lib/tenantApi';
import { exportToCSV } from '@/lib/export';
import PageHeader from '@/components/dashboard/PageHeader';

interface CustomerAggregate {
  key: string;          // phone || email || name (used as identity)
  name: string;
  phone?: string;
  email?: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
}

export default function CustomersPage() {
  const t = useTranslations('pages.dashboard.customers');
  const tc = useTranslations('pages.dashboard.common');
  const tBase = useTranslations('pages.dashboard');
  const locale = useLocale();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getVendorOrders({}).then((res) => {
      if (res.status) {
        const list = Array.isArray(res.data) ? res.data : (res.data as { data: Order[] })?.data ?? [];
        setOrders(list);
      }
      setLoading(false);
    });
  }, []);

  // Aggregate orders into customers
  const customers = useMemo<CustomerAggregate[]>(() => {
    const map = new Map<string, CustomerAggregate>();
    orders.forEach((order) => {
      const key = order.phone || order.email || order.name;
      if (!key) return;

      const existing = map.get(key);
      if (existing) {
        existing.ordersCount += 1;
        existing.totalSpent += Number(order.total);
        if (new Date(order.created_at) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = order.created_at;
        }
      } else {
        map.set(key, {
          key,
          name: order.name,
          phone: order.phone,
          email: order.email,
          ordersCount: 1,
          totalSpent: Number(order.total),
          lastOrderDate: order.created_at,
        });
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()
    );
  }, [orders]);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  }, [customers, search]);

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        action={
          customers.length > 0 && (
            <button
              onClick={() =>
                exportToCSV(
                  customers,
                  [
                    { key: 'name', label: locale === 'ar' ? 'الاسم' : 'Name' },
                    { key: 'phone', label: locale === 'ar' ? 'الهاتف' : 'Phone' },
                    { key: 'email', label: locale === 'ar' ? 'الإيميل' : 'Email' },
                    { key: 'ordersCount', label: locale === 'ar' ? 'عدد الطلبات' : 'Orders' },
                    { key: 'totalSpent', label: locale === 'ar' ? 'إجمالي المشتريات' : 'Total Spent' },
                    { key: 'lastOrderDate', label: locale === 'ar' ? 'آخر طلب' : 'Last Order' },
                  ],
                  'customers'
                )
              }
              className="btn btn-ghost inline-flex items-center gap-2 text-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {locale === 'ar' ? 'تصدير CSV' : 'Export CSV'}
            </button>
          )
        }
      />

      {/* Search */}
      <div className="bg-white border border-[var(--color-border-light)] rounded-xl p-4 mb-4">
        <div className="relative">
          <span className="absolute top-1/2 -translate-y-1/2 start-4 text-[var(--color-text-muted)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full ps-11 pe-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border-light)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
      </div>

      <div className="bg-white border border-[var(--color-border-light)] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-[var(--color-text-muted)]">{tBase('loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-bg-accent)] mx-auto mb-4 flex items-center justify-center text-[var(--color-accent-dark)]">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {t('noItems')}
            </h3>
            <p className="text-sm text-[var(--color-text-light)]">{t('noItemsDesc')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg-warm)] text-[var(--color-text-light)]">
                <tr>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5">{t('table.customer')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5 hidden md:table-cell">{t('table.phone')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5">{t('table.orders')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5">{t('table.totalSpent')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5 hidden lg:table-cell">{t('table.lastOrder')}</th>
                  <th className="text-end text-xs font-semibold uppercase tracking-wider py-3 px-5">{tc('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-light)]">
                {filtered.map((c) => (
                  <tr key={c.key} className="hover:bg-[var(--color-bg-warm)]/50">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--color-text)] truncate">{c.name}</p>
                          {c.email && (
                            <p className="text-xs text-[var(--color-text-muted)] truncate" dir="ltr">{c.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5 hidden md:table-cell">
                      <span className="text-xs text-[var(--color-text-light)]" dir="ltr">{c.phone || '—'}</span>
                    </td>
                    <td className="py-3 px-5">
                      <span className="inline-block bg-[var(--color-bg-accent)] text-[var(--color-accent-dark)] text-xs font-semibold px-2.5 py-1 rounded-full">
                        {c.ordersCount}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <span className="text-sm font-semibold text-[var(--color-accent-dark)]" dir="ltr">
                        {c.totalSpent.toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}
                      </span>
                    </td>
                    <td className="py-3 px-5 hidden lg:table-cell">
                      <span className="text-xs text-[var(--color-text-muted)]" dir="ltr">
                        {new Date(c.lastOrderDate).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-end">
                      <a
                        href={`/${locale}/dashboard/orders?search=${encodeURIComponent(c.phone || c.email || c.name)}`}
                        className="text-xs text-[var(--color-accent-dark)] hover:text-[var(--color-accent)]"
                      >
                        {t('viewOrders')} →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
