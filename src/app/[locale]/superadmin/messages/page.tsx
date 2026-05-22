'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  getMarketingMessages,
  markMarketingReplied,
  deleteMarketingMessage,
  getMarketingMessage,
  type MarketingMessage,
} from '@/lib/adminApi';
import PageHeader from '@/components/dashboard/PageHeader';
import ConfirmDialog from '@/components/dashboard/ConfirmDialog';
import Toast from '@/components/Toast';

const filters: Array<'all' | 'read' | 'unread'> = ['all', 'unread', 'read'];

export default function MarketingMessagesPage() {
  const t = useTranslations('pages.superadmin.messages');
  const tc = useTranslations('pages.dashboard.common');
  const tBase = useTranslations('pages.dashboard');
  const locale = useLocale();

  const [items, setItems] = useState<MarketingMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<MarketingMessage | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MarketingMessage | null>(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    const params: { is_read?: boolean; search?: string } = {};
    if (filter !== 'all') params.is_read = filter === 'read';
    if (search) params.search = search;

    const res = await getMarketingMessages(params);
    setItems(res.status && Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    const id = setTimeout(load, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleOpen = async (msg: MarketingMessage) => {
    setSelected(msg);
    // Mark read on backend (GET endpoint does this automatically)
    if (!msg.is_read) {
      await getMarketingMessage(msg.id);
      setItems((prev) => prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)));
    }
  };

  const handleMarkReplied = async () => {
    if (!selected) return;
    setProcessing(true);
    const res = await markMarketingReplied(selected.id);
    setProcessing(false);
    if (res.status) {
      setSelected({ ...selected, is_replied: true });
      setItems((prev) => prev.map((m) => (m.id === selected.id ? { ...m, is_replied: true } : m)));
      showToast(t('markedReplied'), 'success');
    } else {
      showToast(t('failed'), 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setProcessing(true);
    const res = await deleteMarketingMessage(confirmDelete.id);
    setProcessing(false);
    if (res.status) {
      setItems((prev) => prev.filter((m) => m.id !== confirmDelete.id));
      if (selected?.id === confirmDelete.id) setSelected(null);
      showToast(t('deleted'), 'success');
    } else {
      showToast(t('failed'), 'error');
    }
    setConfirmDelete(null);
  };

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
        {/* List */}
        <div className="bg-white border border-[var(--color-border-light)] rounded-xl overflow-hidden">
          <div className="p-3 border-b border-[var(--color-border-light)]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tBase('common.search')}
              className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border-light)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-sm text-[var(--color-text-muted)]">{tBase('loading')}</div>
            ) : items.length === 0 ? (
              <div className="p-16 text-center">
                <p className="text-sm text-[var(--color-text-muted)]">{t('noItems')}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">{t('noItemsDesc')}</p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--color-border-light)]">
                {items.map((m) => (
                  <li
                    key={m.id}
                    onClick={() => handleOpen(m)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selected?.id === m.id
                        ? 'bg-[var(--color-bg-accent)]'
                        : m.is_read
                          ? 'hover:bg-[var(--color-bg-warm)]/50'
                          : 'bg-amber-50/30 hover:bg-amber-50/60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className={`text-sm truncate ${!m.is_read ? 'font-semibold text-[var(--color-text)]' : 'text-[var(--color-text)]'}`}>
                            {m.name}
                          </p>
                          {!m.is_read && <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] shrink-0" />}
                        </div>
                        {m.subject && <p className="text-xs text-[var(--color-text-light)] truncate">{m.subject}</p>}
                        <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5" dir="ltr">
                          {new Date(m.created_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                          {m.is_replied && (
                            <span className="ms-2 text-emerald-600">✓ تم الرد</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Detail */}
        <div className="bg-white border border-[var(--color-border-light)] rounded-xl p-6 min-h-[600px]">
          {selected ? (
            <>
              <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-[var(--color-border-light)]">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white flex items-center justify-center text-base font-semibold shrink-0">
                    {selected.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-[var(--color-text)]">{selected.name}</p>
                    <a href={`mailto:${selected.email}`} className="text-xs text-[var(--color-accent-dark)] hover:underline" dir="ltr">
                      {selected.email}
                    </a>
                  </div>
                </div>
                {selected.is_replied && (
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full shrink-0">
                    ✓ تم الرد
                  </span>
                )}
              </div>

              {selected.subject && (
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-1">الموضوع</p>
                  <h2 className="text-xl font-semibold text-[var(--color-text)]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {selected.subject}
                  </h2>
                </div>
              )}

              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-2">الرسالة</p>
                <p className="text-[15px] leading-loose text-[var(--color-text)] whitespace-pre-wrap">
                  {selected.message}
                </p>
              </div>

              <div className="text-xs text-[var(--color-text-muted)] mb-5" dir="ltr">
                {new Date(selected.created_at).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')}
              </div>

              <div className="flex gap-2 pt-4 border-t border-[var(--color-border-light)] flex-wrap">
                <a
                  href={`mailto:${selected.email}?subject=${encodeURIComponent('Re: ' + (selected.subject || ''))}`}
                  className="btn btn-primary text-sm gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  {t('detail.replyByEmail')}
                </a>
                {!selected.is_replied && (
                  <button onClick={handleMarkReplied} disabled={processing} className="btn btn-ghost text-sm gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {t('detail.markReplied')}
                  </button>
                )}
                <button onClick={() => setConfirmDelete(selected)} className="btn text-sm bg-red-50 text-[var(--color-error)] hover:bg-red-100 border-red-100 gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                  {t('detail.delete')}
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <div className="w-16 h-16 rounded-full bg-[var(--color-bg-accent)] mx-auto mb-3 flex items-center justify-center text-[var(--color-accent-dark)]">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <p className="text-sm text-[var(--color-text-muted)]">اختار رسالة للعرض</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title={tc('deleteConfirm')}
        message={tc('deleteWarning')}
        confirmLabel={tc('delete')}
        cancelLabel={tc('cancel')}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={processing}
      />

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}
