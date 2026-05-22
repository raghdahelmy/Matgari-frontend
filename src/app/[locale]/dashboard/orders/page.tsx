'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getVendorOrders, type Order, type OrderStatus, type PaymentStatus } from '@/lib/tenantApi';
import { exportToCSV } from '@/lib/export';
import PageHeader from '@/components/dashboard/PageHeader';

const statusFilters: Array<'all' | OrderStatus> = [
  'all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled',
];

export default function OrdersPage() {
  const t = useTranslations('pages.dashboard.orders');
  const tBase = useTranslations('pages.dashboard');
  const locale = useLocale();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | OrderStatus>('all');

  const load = async () => {
    setLoading(true);
    const res = await getVendorOrders({ search, status: activeFilter });
    if (res.status) {
      const list = Array.isArray(res.data) ? res.data : (res.data as { data: Order[] })?.data ?? [];
      setOrders(list);
    } else {
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  useEffect(() => {
    const id = setTimeout(load, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        action={
          orders.length > 0 && (
            <button
              onClick={() =>
                exportToCSV(
                  orders,
                  [
                    { key: 'order_number', label: locale === 'ar' ? 'رقم الطلب' : 'Order #' },
                    { key: 'name', label: locale === 'ar' ? 'العميل' : 'Customer' },
                    { key: 'phone', label: locale === 'ar' ? 'الهاتف' : 'Phone' },
                    { key: 'email', label: locale === 'ar' ? 'الإيميل' : 'Email' },
                    { key: 'city', label: locale === 'ar' ? 'المدينة' : 'City' },
                    { key: 'address', label: locale === 'ar' ? 'العنوان' : 'Address' },
                    { key: 'subtotal', label: locale === 'ar' ? 'المجموع' : 'Subtotal' },
                    { key: 'discount', label: locale === 'ar' ? 'الخصم' : 'Discount' },
                    { key: 'shipping_cost', label: locale === 'ar' ? 'الشحن' : 'Shipping' },
                    { key: 'total', label: locale === 'ar' ? 'الإجمالي' : 'Total' },
                    { key: 'status', label: locale === 'ar' ? 'الحالة' : 'Status' },
                    { key: 'payment_status', label: locale === 'ar' ? 'الدفع' : 'Payment' },
                    { key: 'payment_method', label: locale === 'ar' ? 'طريقة الدفع' : 'Method' },
                    { key: 'created_at', label: locale === 'ar' ? 'التاريخ' : 'Date' },
                  ],
                  'orders'
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

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {statusFilters.map((status) => (
          <button
            key={status}
            onClick={() => setActiveFilter(status)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              activeFilter === status
                ? 'bg-[var(--color-bg-dark)] text-white'
                : 'bg-white text-[var(--color-text-light)] border border-[var(--color-border-light)] hover:border-[var(--color-accent)]'
            }`}
          >
            {t(`filters.${status}`)}
          </button>
        ))}
      </div>

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

      {/* Table */}
      <div className="bg-white border border-[var(--color-border-light)] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-[var(--color-text-muted)]">{tBase('loading')}</div>
        ) : orders.length === 0 ? (
          <EmptyState title={t('noOrders')} desc={t('noOrdersDesc')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg-warm)] text-[var(--color-text-light)]">
                <tr>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5">{t('table.orderNumber')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5">{t('table.customer')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5 hidden md:table-cell">{t('table.items')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5">{t('table.total')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5">{t('table.status')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5 hidden sm:table-cell">{t('table.paymentStatus')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5 hidden lg:table-cell">{t('table.date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-light)]">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => (window.location.href = `/${locale}/dashboard/orders/${order.id}`)}
                    className="hover:bg-[var(--color-bg-warm)]/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-5">
                      <span className="text-sm font-medium text-[var(--color-text)]" dir="ltr">
                        #{order.order_number}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <div className="text-sm font-medium text-[var(--color-text)]">{order.name}</div>
                      {order.phone && (
                        <div className="text-xs text-[var(--color-text-muted)]" dir="ltr">{order.phone}</div>
                      )}
                    </td>
                    <td className="py-3 px-5 hidden md:table-cell">
                      <span className="text-sm text-[var(--color-text-light)]">
                        {order.items?.length ?? 0}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <span className="text-sm font-semibold text-[var(--color-accent-dark)]">
                        {Number(order.total).toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <StatusBadge status={order.status} t={t} />
                    </td>
                    <td className="py-3 px-5 hidden sm:table-cell">
                      <PaymentBadge status={order.payment_status} t={t} />
                    </td>
                    <td className="py-3 px-5 hidden lg:table-cell">
                      <span className="text-xs text-[var(--color-text-muted)]" dir="ltr">
                        {new Date(order.created_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                      </span>
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

export function StatusBadge({ status, t }: { status: OrderStatus; t: (k: string) => string }) {
  const map: Record<OrderStatus, { bg: string; text: string }> = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700' },
    processing: { bg: 'bg-blue-50', text: 'text-blue-700' },
    shipped: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
    delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700' },
  };
  const cls = map[status] || { bg: 'bg-gray-50', text: 'text-gray-600' };
  return (
    <span className={`inline-block ${cls.bg} ${cls.text} text-[11px] font-medium px-2.5 py-1 rounded-full`}>
      {t(`statuses.${status}`)}
    </span>
  );
}

export function PaymentBadge({ status, t }: { status: PaymentStatus; t: (k: string) => string }) {
  const map: Record<PaymentStatus, { bg: string; text: string }> = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700' },
    paid: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
    failed: { bg: 'bg-red-50', text: 'text-red-700' },
    refunded: { bg: 'bg-purple-50', text: 'text-purple-700' },
  };
  const cls = map[status] || { bg: 'bg-gray-50', text: 'text-gray-600' };
  return (
    <span className={`inline-block ${cls.bg} ${cls.text} text-[11px] font-medium px-2.5 py-1 rounded-full`}>
      {t(`payment.${status}`)}
    </span>
  );
}

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-16 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--color-bg-accent)] mx-auto mb-4 flex items-center justify-center text-[var(--color-accent-dark)]">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        {title}
      </h3>
      <p className="text-sm text-[var(--color-text-light)]">{desc}</p>
    </div>
  );
}
