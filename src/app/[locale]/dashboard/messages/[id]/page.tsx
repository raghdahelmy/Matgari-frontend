'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  getContactMessage,
  markContactMessageReplied,
  deleteContactMessage,
  type ContactMessage,
} from '@/lib/tenantApi';
import PageHeader from '@/components/dashboard/PageHeader';
import ConfirmDialog from '@/components/dashboard/ConfirmDialog';
import Toast from '@/components/Toast';

export default function MessageDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = use(params);
  const messageId = Number(id);

  const t = useTranslations('pages.dashboard.messages');
  const tc = useTranslations('pages.dashboard.common');
  const tBase = useTranslations('pages.dashboard');
  const locale = useLocale();
  const router = useRouter();

  const [message, setMessage] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    // Calling GET /vendor/contact/{id} marks it as read on the backend
    getContactMessage(messageId).then((res) => {
      if (res.status) setMessage(res.data);
      setLoading(false);
    });
  }, [messageId]);

  const handleMarkReplied = async () => {
    if (!message) return;
    setProcessing(true);
    const res = await markContactMessageReplied(messageId);
    setProcessing(false);
    if (res.status) {
      setMessage({ ...message, status: 'replied' });
      showToast(t('markedReplied'), 'success');
    } else {
      showToast(t('failed'), 'error');
    }
  };

  const handleDelete = async () => {
    setProcessing(true);
    const res = await deleteContactMessage(messageId);
    setProcessing(false);
    if (res.status) {
      showToast(t('deleted'), 'success');
      setTimeout(() => router.push(`/${locale}/dashboard/messages`), 800);
    } else {
      showToast(t('failed'), 'error');
    }
    setConfirmDelete(false);
  };

  if (loading) {
    return (
      <>
        <PageHeader title="..." />
        <div className="h-96 bg-[var(--color-bg-warm)] rounded-xl animate-pulse" />
      </>
    );
  }

  if (!message) {
    return (
      <>
        <PageHeader title={t('detail.back')} />
        <div className="bg-white rounded-xl p-12 text-center">
          <p className="text-[var(--color-text-muted)]">{tBase('error')}</p>
        </div>
      </>
    );
  }

  // Build action URLs
  const emailUrl = message.email
    ? `mailto:${message.email}?subject=${encodeURIComponent('Re: ' + (message.subject || ''))}`
    : null;
  const whatsappPhone = message.phone?.replace(/[^\d]/g, '');
  const whatsappUrl = whatsappPhone ? `https://wa.me/${whatsappPhone}` : null;

  return (
    <>
      <PageHeader
        title={message.subject || message.name}
        subtitle={t('detail.receivedAt') + ': ' + new Date(message.created_at).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')}
        action={
          <a href={`/${locale}/dashboard/messages`} className="btn btn-ghost text-sm">
            ← {t('detail.back')}
          </a>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* Message body */}
        <div className="bg-white border border-[var(--color-border-light)] rounded-xl p-6 order-2 lg:order-1">
          <div className="flex items-center gap-4 mb-6 pb-5 border-b border-[var(--color-border-light)]">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white flex items-center justify-center text-base font-semibold shrink-0">
              {message.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-[var(--color-text)]">{message.name}</p>
              {message.email && (
                <p className="text-xs text-[var(--color-text-muted)]" dir="ltr">{message.email}</p>
              )}
            </div>
            <StatusBadge status={message.status} t={t} />
          </div>

          {message.subject && (
            <div className="mb-4">
              <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                {t('detail.subject')}
              </span>
              <h2
                className="text-xl font-semibold text-[var(--color-text)] mt-1"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {message.subject}
              </h2>
            </div>
          )}

          <div>
            <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
              {t('detail.message')}
            </span>
            <p className="text-[15px] leading-loose text-[var(--color-text)] mt-2 whitespace-pre-wrap">
              {message.message}
            </p>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4 order-1 lg:order-2">
          {/* Contact info */}
          <div className="bg-white border border-[var(--color-border-light)] rounded-xl p-5">
            <h3
              className="text-sm font-semibold text-[var(--color-text)] mb-4"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {t('detail.from')}
            </h3>
            <div className="space-y-3 text-sm">
              <Field label={tc('name')} value={message.name} />
              {message.phone && <Field label={t('detail.phone')} value={message.phone} dir="ltr" />}
              {message.email && <Field label={t('detail.email')} value={message.email} dir="ltr" />}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white border border-[var(--color-border-light)] rounded-xl p-5">
            <h3
              className="text-sm font-semibold text-[var(--color-text)] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {tBase('common.actions')}
            </h3>
            <div className="space-y-2">
              {emailUrl && (
                <a href={emailUrl} className="btn btn-primary w-full justify-center text-sm gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  {t('detail.replyByEmail')}
                </a>
              )}
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener" className="btn btn-ghost w-full justify-center text-sm gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {t('detail.replyByWhatsapp')}
                </a>
              )}
              {message.status !== 'replied' && (
                <button
                  onClick={handleMarkReplied}
                  disabled={processing}
                  className="btn btn-ghost w-full justify-center text-sm gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t('detail.markReplied')}
                </button>
              )}
              <button
                onClick={() => setConfirmDelete(true)}
                className="btn w-full justify-center text-sm gap-2 bg-red-50 text-[var(--color-error)] hover:bg-red-100 border-red-100"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
                {t('detail.delete')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={tc('deleteConfirm')}
        message={tc('deleteWarning')}
        confirmLabel={tc('delete')}
        cancelLabel={tc('cancel')}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        loading={processing}
      />

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}

function Field({ label, value, dir = 'auto' }: { label: string; value: string; dir?: 'auto' | 'ltr' | 'rtl' }) {
  return (
    <div>
      <span className="block text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-0.5">
        {label}
      </span>
      <span className="block text-sm text-[var(--color-text)]" dir={dir}>
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status, t }: { status: 'unread' | 'read' | 'replied'; t: (k: string) => string }) {
  const map = {
    unread: 'bg-blue-50 text-blue-700',
    read: 'bg-gray-100 text-gray-700',
    replied: 'bg-emerald-50 text-emerald-700',
  };
  return (
    <span className={`inline-block ${map[status]} text-[10px] font-medium px-2.5 py-1 rounded-full shrink-0`}>
      {t(`statuses.${status}`)}
    </span>
  );
}
