'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  getNotifications,
  markNotificationRead,
  markAllRead,
  deleteNotification,
  clearAllNotifications,
  type Notification,
} from '@/lib/tenantApi';
import PageHeader from '@/components/dashboard/PageHeader';
import ConfirmDialog from '@/components/dashboard/ConfirmDialog';
import Toast from '@/components/Toast';

export default function NotificationsPage() {
  const t = useTranslations('pages.dashboard.notifications');
  const tc = useTranslations('pages.dashboard.common');
  const tBase = useTranslations('pages.dashboard');
  const locale = useLocale();

  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    const res = await getNotifications();
    setItems(res.status && Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = filter === 'unread' ? items.filter((n) => !n.is_read) : items;
  const unreadCount = items.filter((n) => !n.is_read).length;

  const handleMarkOne = async (notif: Notification) => {
    if (notif.is_read) return;
    // Optimistic update
    setItems((prev) => prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n)));
    const res = await markNotificationRead(notif.id);
    if (!res.status) {
      // Revert
      setItems((prev) => prev.map((n) => (n.id === notif.id ? { ...n, is_read: false } : n)));
      showToast(t('failed'), 'error');
    }
  };

  const handleMarkAll = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    const res = await markAllRead();
    if (res.status) {
      showToast(t('allMarked'), 'success');
    } else {
      load(); // refetch to revert
      showToast(t('failed'), 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const before = items;
    setItems((prev) => prev.filter((n) => n.id !== id));
    const res = await deleteNotification(id);
    if (res.status) {
      showToast(t('deleted'), 'success');
    } else {
      setItems(before);
      showToast(t('failed'), 'error');
    }
  };

  const handleClearAll = async () => {
    setClearing(true);
    const res = await clearAllNotifications();
    setClearing(false);
    if (res.status) {
      setItems([]);
      showToast(t('cleared'), 'success');
    } else {
      showToast(t('failed'), 'error');
    }
    setConfirmClear(false);
  };

  const formatTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return t('justNow');
    if (m < 60) return t('minutesAgo', { m });
    const h = Math.floor(m / 60);
    if (h < 24) return t('hoursAgo', { h });
    const d = Math.floor(h / 24);
    return t('daysAgo', { d });
  };

  const getIcon = (type: string) => {
    if (type.includes('order')) {
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', svg: <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z M3 6h18 M16 10a4 4 0 01-8 0" /> };
    }
    if (type.includes('review')) {
      return { bg: 'bg-amber-50', text: 'text-amber-700', svg: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /> };
    }
    if (type.includes('message') || type.includes('contact')) {
      return { bg: 'bg-blue-50', text: 'text-blue-700', svg: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /> };
    }
    if (type.includes('stock')) {
      return { bg: 'bg-red-50', text: 'text-red-700', svg: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></> };
    }
    return { bg: 'bg-[var(--color-bg-accent)]', text: 'text-[var(--color-accent-dark)]', svg: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></> };
  };

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        action={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button onClick={handleMarkAll} className="btn btn-ghost text-sm">
                {t('markAllRead')}
              </button>
            )}
            {items.length > 0 && (
              <button onClick={() => setConfirmClear(true)} className="btn btn-ghost text-sm text-[var(--color-error)] hover:text-[var(--color-error)]">
                {t('clearAll')}
              </button>
            )}
          </div>
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'unread'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-2 ${
              filter === f
                ? 'bg-[var(--color-bg-dark)] text-white'
                : 'bg-white text-[var(--color-text-light)] border border-[var(--color-border-light)] hover:border-[var(--color-accent)]'
            }`}
          >
            {t(f)}
            {f === 'unread' && unreadCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filter === f ? 'bg-white text-[var(--color-bg-dark)]' : 'bg-[var(--color-accent)] text-white'}`}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white border border-[var(--color-border-light)] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-[var(--color-text-muted)]">{tBase('loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-bg-accent)] mx-auto mb-4 flex items-center justify-center text-[var(--color-accent-dark)]">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {t('noItems')}
            </h3>
            <p className="text-sm text-[var(--color-text-light)]">{t('noItemsDesc')}</p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-border-light)]">
            {filtered.map((notif) => {
              const icon = getIcon(notif.type);
              return (
                <li
                  key={notif.id}
                  onClick={() => handleMarkOne(notif)}
                  className={`group p-4 md:p-5 flex items-start gap-4 cursor-pointer transition-colors hover:bg-[var(--color-bg-warm)]/50 ${
                    !notif.is_read ? 'bg-[var(--color-bg-accent)]/30' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full ${icon.bg} ${icon.text} flex items-center justify-center shrink-0`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      {icon.svg}
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <h4 className="text-sm font-semibold text-[var(--color-text)] line-clamp-1">
                        {notif.title}
                      </h4>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-[var(--color-text-light)] line-clamp-2">{notif.message}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-1.5" dir="ltr">
                      {formatTime(notif.created_at)} {locale === 'ar' && '·'} {' '}
                      <span className="opacity-60">{new Date(notif.created_at).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')}</span>
                    </p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notif.id);
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-red-50 hover:text-[var(--color-error)] opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    aria-label={tc('delete')}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={confirmClear}
        title={t('clearAll')}
        message={tc('deleteWarning')}
        confirmLabel={tc('confirm')}
        cancelLabel={tc('cancel')}
        onConfirm={handleClearAll}
        onCancel={() => setConfirmClear(false)}
        loading={clearing}
      />

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}
