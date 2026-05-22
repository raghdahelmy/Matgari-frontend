'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  getTenants,
  approveTenant,
  rejectTenant,
  cancelTenant,
  suspendTenant,
  activateTenant,
  type Vendor,
  type VendorStatus,
} from '@/lib/adminApi';
import PageHeader from '@/components/dashboard/PageHeader';
import ConfirmDialog from '@/components/dashboard/ConfirmDialog';
import Toast from '@/components/Toast';

const filters: Array<'all' | VendorStatus> = ['all', 'pending', 'approved', 'rejected', 'cancelled'];

type ActionType = 'approve' | 'reject' | 'cancel' | 'suspend' | 'activate';

export default function TenantsPage() {
  const t = useTranslations('pages.superadmin.tenants');
  const tc = useTranslations('pages.dashboard.common');
  const tBase = useTranslations('pages.dashboard');
  const locale = useLocale();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | VendorStatus>('all');
  const [search, setSearch] = useState('');
  const [pendingAction, setPendingAction] = useState<{ type: ActionType; vendor: Vendor } | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    const res = await getTenants(filter);
    setVendors(res.status && Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const filtered = useMemo(() => {
    if (!search.trim()) return vendors;
    const q = search.toLowerCase();
    return vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        v.store_name?.toLowerCase().includes(q)
    );
  }, [vendors, search]);

  const executeAction = async () => {
    if (!pendingAction) return;
    const { type, vendor } = pendingAction;
    setProcessing(true);

    let res;
    switch (type) {
      case 'approve':
        res = await approveTenant(vendor.id);
        break;
      case 'reject':
        res = await rejectTenant(vendor.id);
        break;
      case 'cancel':
        res = await cancelTenant(vendor.id);
        break;
      case 'suspend':
        res = await suspendTenant(vendor.id, suspendReason || undefined);
        break;
      case 'activate':
        res = await activateTenant(vendor.id);
        break;
    }

    setProcessing(false);

    if (res.status) {
      const messages: Record<ActionType, string> = {
        approve: t('approved'),
        reject: t('rejected'),
        cancel: t('cancelled'),
        suspend: t('suspended'),
        activate: t('activated'),
      };
      showToast(messages[type], 'success');
      load();
    } else {
      showToast(res.message || t('failed'), 'error');
    }

    setPendingAction(null);
    setSuspendReason('');
  };

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              filter === f
                ? 'bg-[var(--color-bg-dark)] text-white'
                : 'bg-white text-[var(--color-text-light)] border border-[var(--color-border-light)] hover:border-[var(--color-accent)]'
            }`}
          >
            {t(`filters.${f}`)}
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
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-[var(--color-text-muted)]">{t('noItems')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg-warm)] text-[var(--color-text-light)]">
                <tr>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5">{t('table.vendor')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5 hidden md:table-cell">{t('table.store')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5 hidden lg:table-cell">{t('table.phone')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5">{t('table.status')}</th>
                  <th className="text-end text-xs font-semibold uppercase tracking-wider py-3 px-5">{tc('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-light)]">
                {filtered.map((vendor) => (
                  <tr
                    key={vendor.id}
                    onClick={() => (window.location.href = `/${locale}/superadmin/tenants/${vendor.id}`)}
                    className="hover:bg-[var(--color-bg-warm)]/50 cursor-pointer"
                  >
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                          {vendor.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--color-text)] truncate">{vendor.name}</p>
                          <p className="text-xs text-[var(--color-text-muted)] truncate" dir="ltr">{vendor.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5 hidden md:table-cell">
                      <span className="text-sm text-[var(--color-text)]" dir="ltr">
                        {vendor.store_name || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-5 hidden lg:table-cell">
                      <span className="text-xs text-[var(--color-text-light)]" dir="ltr">{vendor.phone || '—'}</span>
                    </td>
                    <td className="py-3 px-5">
                      <StatusBadge status={vendor.status} t={t} />
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center justify-end gap-1">
                        {vendor.status === 'pending' && (
                          <>
                            <ActionBtn label={t('actions.approve')} icon="check" variant="success" onClick={() => setPendingAction({ type: 'approve', vendor })} />
                            <ActionBtn label={t('actions.reject')} icon="x" variant="danger" onClick={() => setPendingAction({ type: 'reject', vendor })} />
                          </>
                        )}
                        {vendor.status === 'approved' && (
                          <>
                            {vendor.tenant_active !== false && (
                              <ActionBtn label={t('actions.suspend')} icon="ban" variant="warning" onClick={() => setPendingAction({ type: 'suspend', vendor })} />
                            )}
                            {vendor.tenant_active === false && (
                              <ActionBtn label={t('actions.activate')} icon="check" variant="success" onClick={() => setPendingAction({ type: 'activate', vendor })} />
                            )}
                            <ActionBtn label={t('actions.cancel')} icon="trash" variant="danger" onClick={() => setPendingAction({ type: 'cancel', vendor })} />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm dialog with optional reason for suspend */}
      {pendingAction && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-[var(--color-bg-dark)]/50 backdrop-blur-sm" onClick={() => setPendingAction(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {pendingAction.type === 'suspend' ? t('confirmSuspend') : tc('deleteConfirm')}
            </h3>
            <p className="text-sm text-[var(--color-text-light)] mb-4">{pendingAction.vendor.name}</p>

            {pendingAction.type === 'suspend' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5">{t('suspendReason')}</label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder={t('suspendReasonPlaceholder')}
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm min-h-[80px] focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>
            )}

            <div className="flex gap-2.5">
              <button onClick={() => { setPendingAction(null); setSuspendReason(''); }} className="btn btn-ghost flex-1" disabled={processing}>
                {tc('cancel')}
              </button>
              <button
                onClick={executeAction}
                disabled={processing}
                className={`btn flex-1 border-2 text-white ${
                  pendingAction.type === 'approve' || pendingAction.type === 'activate'
                    ? 'bg-[var(--color-success)] border-[var(--color-success)]'
                    : pendingAction.type === 'suspend'
                    ? 'bg-amber-600 border-amber-600 hover:bg-amber-700'
                    : 'bg-[var(--color-error)] border-[var(--color-error)] hover:bg-red-700'
                }`}
              >
                {processing ? '...' : tc('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}

function StatusBadge({ status, t }: { status: VendorStatus; t: (k: string) => string }) {
  const map: Record<VendorStatus, string> = {
    pending: 'bg-amber-50 text-amber-700',
    approved: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-red-50 text-red-700',
    cancelled: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`inline-block ${map[status]} text-[11px] font-medium px-2.5 py-1 rounded-full`}>
      {t(`statuses.${status}`)}
    </span>
  );
}

function ActionBtn({
  label, icon, variant, onClick,
}: {
  label: string;
  icon: string;
  variant: 'success' | 'danger' | 'warning';
  onClick: () => void;
}) {
  const variantClass = {
    success: 'text-[var(--color-success)] hover:bg-emerald-50',
    danger: 'text-[var(--color-error)] hover:bg-red-50',
    warning: 'text-amber-600 hover:bg-amber-50',
  }[variant];

  const iconSvg = {
    check: <polyline points="20 6 9 17 4 12" />,
    x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    ban: <><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></>,
  }[icon];

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${variantClass}`}
      aria-label={label}
      title={label}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {iconSvg}
      </svg>
    </button>
  );
}
