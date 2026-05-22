'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  getContactMessages,
  deleteContactMessage,
  type ContactMessage,
  type ContactMessageStatus,
} from '@/lib/tenantApi';
import PageHeader from '@/components/dashboard/PageHeader';
import ConfirmDialog from '@/components/dashboard/ConfirmDialog';
import Toast from '@/components/Toast';

const statusFilters: Array<'all' | ContactMessageStatus> = ['all', 'unread', 'read', 'replied'];

export default function MessagesPage() {
  const t = useTranslations('pages.dashboard.messages');
  const tc = useTranslations('pages.dashboard.common');
  const tBase = useTranslations('pages.dashboard');
  const locale = useLocale();

  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | ContactMessageStatus>('all');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    const res = await getContactMessages();
    setItems(res.status && Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = items;
    if (activeFilter !== 'all') list = list.filter((m) => m.status === activeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.subject?.toLowerCase().includes(q) ||
          m.message.toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, activeFilter, search]);

  const unreadCount = items.filter((m) => m.status === 'unread').length;

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    const res = await deleteContactMessage(confirmDelete.id);
    setDeleting(false);
    if (res.status) {
      setItems((prev) => prev.filter((m) => m.id !== confirmDelete.id));
      showToast(t('deleted'), 'success');
    } else {
      showToast(t('failed'), 'error');
    }
    setConfirmDelete(null);
  };

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {statusFilters.map((status) => {
          const count = status === 'all' ? items.length : items.filter((m) => m.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-2 ${
                activeFilter === status
                  ? 'bg-[var(--color-bg-dark)] text-white'
                  : 'bg-white text-[var(--color-text-light)] border border-[var(--color-border-light)] hover:border-[var(--color-accent)]'
              }`}
            >
              {t(`filters.${status}`)}
              {status === 'unread' && unreadCount > 0 ? (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeFilter === status ? 'bg-white text-[var(--color-bg-dark)]' : 'bg-[var(--color-accent)] text-white'}`}>
                  {unreadCount}
                </span>
              ) : count > 0 && status !== 'all' ? (
                <span className="text-[10px] opacity-60">({count})</span>
              ) : null}
            </button>
          );
        })}
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

      {/* List */}
      <div className="bg-white border border-[var(--color-border-light)] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-[var(--color-text-muted)]">{tBase('loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-bg-accent)] mx-auto mb-4 flex items-center justify-center text-[var(--color-accent-dark)]">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {t('noItems')}
            </h3>
            <p className="text-sm text-[var(--color-text-light)]">{t('noItemsDesc')}</p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-border-light)]">
            {filtered.map((msg) => (
              <li
                key={msg.id}
                className={`group flex items-center gap-3 p-4 md:p-5 transition-colors hover:bg-[var(--color-bg-warm)]/50 ${
                  msg.status === 'unread' ? 'bg-[var(--color-bg-accent)]/30' : ''
                }`}
              >
                <a href={`/${locale}/dashboard/messages/${msg.id}`} className="flex-1 flex items-center gap-4 min-w-0">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                    msg.status === 'unread'
                      ? 'bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white'
                      : 'bg-[var(--color-bg-warm)] text-[var(--color-text-light)]'
                  }`}>
                    {msg.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <p className={`text-sm truncate ${msg.status === 'unread' ? 'font-semibold text-[var(--color-text)]' : 'font-medium text-[var(--color-text)]'}`}>
                        {msg.name}
                      </p>
                      {msg.status === 'unread' && (
                        <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] shrink-0" />
                      )}
                    </div>
                    {msg.subject && (
                      <p className="text-sm text-[var(--color-text-light)] truncate mb-0.5">{msg.subject}</p>
                    )}
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">{msg.message}</p>
                  </div>

                  {/* Right side */}
                  <div className="text-end shrink-0 hidden sm:block">
                    <StatusBadge status={msg.status} t={t} />
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1" dir="ltr">
                      {new Date(msg.created_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                    </p>
                  </div>
                </a>

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete(msg);
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-red-50 hover:text-[var(--color-error)] opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  aria-label={tc('delete')}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title={tc('deleteConfirm')}
        message={confirmDelete ? `${confirmDelete.name} — ${tc('deleteWarning')}` : ''}
        confirmLabel={tc('delete')}
        cancelLabel={tc('cancel')}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}

function StatusBadge({ status, t }: { status: ContactMessageStatus; t: (k: string) => string }) {
  const map: Record<ContactMessageStatus, string> = {
    unread: 'bg-blue-50 text-blue-700',
    read: 'bg-gray-100 text-gray-700',
    replied: 'bg-emerald-50 text-emerald-700',
  };
  return (
    <span className={`inline-block ${map[status]} text-[10px] font-medium px-2 py-0.5 rounded-full`}>
      {t(`statuses.${status}`)}
    </span>
  );
}
