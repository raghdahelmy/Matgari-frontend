'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  getTenants,
  getAdminSubscriptions,
  approveTenant,
  rejectTenant,
  cancelTenant,
  suspendTenant,
  activateTenant,
  type Vendor,
  type AdminSubscription,
} from '@/lib/adminApi';
import PageHeader from '@/components/dashboard/PageHeader';
import Toast from '@/components/Toast';

export default function TenantDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = use(params);
  const userId = Number(id);

  const t = useTranslations('pages.superadmin.tenants');
  const tSubs = useTranslations('pages.superadmin.subscriptions');
  const tBase = useTranslations('pages.dashboard');
  const locale = useLocale();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [subs, setSubs] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    // We don't have a single tenant endpoint, so we fetch all + filter
    const [tenantsRes, subsRes] = await Promise.all([
      getTenants('all' as 'all'),
      getAdminSubscriptions({}),
    ]);

    if (tenantsRes.status && Array.isArray(tenantsRes.data)) {
      const found = tenantsRes.data.find((v) => v.id === userId);
      setVendor(found || null);
    }

    if (subsRes.status && Array.isArray(subsRes.data)) {
      setSubs(subsRes.data.filter((s) => s.user_id === userId));
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const action = async (type: 'approve' | 'reject' | 'cancel' | 'suspend' | 'activate', reason?: string) => {
    if (!vendor) return;
    setProcessing(true);
    let res;
    switch (type) {
      case 'approve':  res = await approveTenant(vendor.id); break;
      case 'reject':   res = await rejectTenant(vendor.id); break;
      case 'cancel':   res = await cancelTenant(vendor.id); break;
      case 'suspend':  res = await suspendTenant(vendor.id, reason); break;
      case 'activate': res = await activateTenant(vendor.id); break;
    }
    setProcessing(false);

    if (res.status) {
      const msg = { approve: t('approved'), reject: t('rejected'), cancel: t('cancelled'), suspend: t('suspended'), activate: t('activated') };
      showToast(msg[type], 'success');
      load();
    } else {
      showToast(res.message || t('failed'), 'error');
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader title="..." />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          <div className="h-96 bg-[var(--color-bg-warm)] rounded-xl animate-pulse" />
          <div className="h-72 bg-[var(--color-bg-warm)] rounded-xl animate-pulse" />
        </div>
      </>
    );
  }

  if (!vendor) {
    return (
      <>
        <PageHeader title="—" action={<a href={`/${locale}/superadmin/tenants`} className="btn btn-ghost text-sm">← {locale === 'ar' ? 'رجوع' : 'Back'}</a>} />
        <div className="bg-white rounded-xl p-12 text-center">
          <p className="text-[var(--color-text-muted)]">{tBase('error')}</p>
        </div>
      </>
    );
  }

  const storeUrl = vendor.store_name ? `http://${vendor.store_name}.api-matgary.test` : null;
  const activeSub = subs.find((s) => s.status === 'active' || s.status === 'grace_period');

  return (
    <>
      <PageHeader
        title={vendor.name}
        subtitle={vendor.email}
        action={
          <a href={`/${locale}/superadmin/tenants`} className="btn btn-ghost text-sm">
            ← {locale === 'ar' ? 'رجوع' : 'Back'}
          </a>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        {/* Main column */}
        <div className="space-y-5">
          {/* Vendor info */}
          <Card title={locale === 'ar' ? 'بيانات التاجر' : 'Vendor Info'}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Field label={locale === 'ar' ? 'الاسم' : 'Name'} value={vendor.name} />
              <Field label={locale === 'ar' ? 'البريد' : 'Email'} value={vendor.email} dir="ltr" />
              <Field label={locale === 'ar' ? 'الهاتف' : 'Phone'} value={vendor.phone || '—'} dir="ltr" />
              <Field label={locale === 'ar' ? 'اسم المتجر' : 'Store'} value={vendor.store_name || '—'} dir="ltr" />
              <Field label={locale === 'ar' ? 'تاريخ التسجيل' : 'Joined'} value={vendor.created_at ? new Date(vendor.created_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US') : '—'} dir="ltr" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                  {locale === 'ar' ? 'الحالة' : 'Status'}
                </p>
                <StatusBadge status={vendor.status} t={t} />
              </div>
            </div>
          </Card>

          {/* Active subscription */}
          {activeSub && (
            <Card title={locale === 'ar' ? 'الاشتراك النشط' : 'Active Subscription'}>
              <div className="bg-gradient-to-br from-[var(--color-bg-dark)] to-[#0a4a3f] rounded-xl p-5 text-white">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">{activeSub.plan?.name}</span>
                    <p className="text-2xl font-semibold mt-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      {Number(activeSub.amount).toLocaleString()} {activeSub.currency}
                    </p>
                    <p className="text-xs text-white/70 mt-1">{tSubs(`cycles.${activeSub.billing_cycle}`)}</p>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-200 text-xs font-medium px-3 py-1 rounded-full">
                    {tSubs(`statuses.${activeSub.status}`)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {activeSub.starts_at && (
                    <div>
                      <p className="text-white/50 mb-0.5">{locale === 'ar' ? 'بدأ' : 'Started'}</p>
                      <p className="text-white" dir="ltr">{new Date(activeSub.starts_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}</p>
                    </div>
                  )}
                  {activeSub.ends_at && (
                    <div>
                      <p className="text-white/50 mb-0.5">{locale === 'ar' ? 'ينتهي' : 'Ends'}</p>
                      <p className="text-white" dir="ltr">{new Date(activeSub.ends_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Subscription history */}
          <Card title={locale === 'ar' ? 'سجل الاشتراكات' : 'Subscription History'}>
            {subs.length === 0 ? (
              <p className="text-sm text-center text-[var(--color-text-muted)] py-6">
                {locale === 'ar' ? 'مفيش اشتراكات' : 'No subscriptions'}
              </p>
            ) : (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--color-bg-warm)] text-[var(--color-text-light)]">
                    <tr>
                      <th className="text-start text-[11px] font-semibold uppercase tracking-wider py-2.5 px-3">{tSubs('table.plan')}</th>
                      <th className="text-start text-[11px] font-semibold uppercase tracking-wider py-2.5 px-3">{tSubs('table.cycle')}</th>
                      <th className="text-start text-[11px] font-semibold uppercase tracking-wider py-2.5 px-3">{tSubs('table.amount')}</th>
                      <th className="text-start text-[11px] font-semibold uppercase tracking-wider py-2.5 px-3">{tSubs('table.status')}</th>
                      <th className="text-start text-[11px] font-semibold uppercase tracking-wider py-2.5 px-3 hidden md:table-cell">{tSubs('table.date')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border-light)]">
                    {subs.map((sub) => (
                      <tr key={sub.id}>
                        <td className="py-2.5 px-3 font-medium text-[var(--color-text)]">{sub.plan?.name || '—'}</td>
                        <td className="py-2.5 px-3 text-xs text-[var(--color-text-light)]">{tSubs(`cycles.${sub.billing_cycle}`)}</td>
                        <td className="py-2.5 px-3 font-semibold text-[var(--color-accent-dark)]" dir="ltr">
                          {Number(sub.amount).toLocaleString()} {sub.currency}
                        </td>
                        <td className="py-2.5 px-3">
                          <SubStatusBadge status={sub.status} t={tSubs} />
                        </td>
                        <td className="py-2.5 px-3 text-xs text-[var(--color-text-muted)] hidden md:table-cell" dir="ltr">
                          {new Date(sub.created_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Side: Actions */}
        <aside className="space-y-5">
          <Card title={locale === 'ar' ? 'إجراءات' : 'Actions'}>
            <div className="space-y-2">
              {vendor.status === 'pending' && (
                <>
                  <button onClick={() => action('approve')} disabled={processing} className="btn btn-primary w-full text-sm gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {t('actions.approve')}
                  </button>
                  <button onClick={() => action('reject')} disabled={processing} className="btn w-full text-sm gap-2 bg-red-50 text-[var(--color-error)] hover:bg-red-100 border-red-100">
                    {t('actions.reject')}
                  </button>
                </>
              )}

              {vendor.status === 'approved' && (
                <>
                  {storeUrl && (
                    <a href={storeUrl} target="_blank" rel="noopener" className="btn btn-ghost w-full text-sm gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      {t('actions.visitStore')}
                    </a>
                  )}
                  {vendor.tenant_active !== false ? (
                    <button onClick={() => {
                      const reason = prompt(t('suspendReasonPlaceholder')) ?? undefined;
                      action('suspend', reason);
                    }} disabled={processing} className="btn w-full text-sm gap-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                      </svg>
                      {t('actions.suspend')}
                    </button>
                  ) : (
                    <button onClick={() => action('activate')} disabled={processing} className="btn btn-primary w-full text-sm gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {t('actions.activate')}
                    </button>
                  )}
                  <button onClick={() => action('cancel')} disabled={processing} className="btn w-full text-sm gap-2 bg-red-50 text-[var(--color-error)] hover:bg-red-100 border-red-100">
                    {t('actions.cancel')}
                  </button>
                </>
              )}
            </div>
          </Card>

          {/* Quick stats */}
          <Card title={locale === 'ar' ? 'إحصائيات سريعة' : 'Quick Stats'}>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">{locale === 'ar' ? 'إجمالي الاشتراكات' : 'Total Subscriptions'}</span>
                <span className="font-semibold text-[var(--color-text)]">{subs.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">{locale === 'ar' ? 'إجمالي المدفوعات' : 'Total Paid'}</span>
                <span className="font-semibold text-[var(--color-accent-dark)]" dir="ltr">
                  {subs.filter((s) => ['active', 'expired', 'grace_period'].includes(s.status)).reduce((sum, s) => sum + Number(s.amount), 0).toLocaleString()} EGP
                </span>
              </div>
            </div>
          </Card>
        </aside>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[var(--color-border-light)] rounded-xl p-5">
      <h2 className="text-base font-semibold text-[var(--color-text)] mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, value, dir = 'auto' }: { label: string; value: string; dir?: 'auto' | 'ltr' | 'rtl' }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">{label}</p>
      <p className="text-[var(--color-text)]" dir={dir}>{value}</p>
    </div>
  );
}

function StatusBadge({ status, t }: { status: string; t: (k: string) => string }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700',
    approved: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-red-50 text-red-700',
    cancelled: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`inline-block ${map[status] || map.cancelled} text-xs font-medium px-2.5 py-1 rounded-full`}>
      {t(`statuses.${status}`)}
    </span>
  );
}

function SubStatusBadge({ status, t }: { status: string; t: (k: string) => string }) {
  const map: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700',
    pending: 'bg-amber-50 text-amber-700',
    expired: 'bg-red-50 text-red-700',
    cancelled: 'bg-gray-100 text-gray-600',
    grace_period: 'bg-orange-50 text-orange-700',
  };
  return (
    <span className={`inline-block ${map[status] || map.cancelled} text-[10px] font-medium px-2 py-0.5 rounded-full`}>
      {t(`statuses.${status}`)}
    </span>
  );
}
