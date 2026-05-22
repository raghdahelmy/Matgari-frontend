'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getPendingReviews, approveReview, rejectReview, type Review } from '@/lib/tenantApi';
import PageHeader from '@/components/dashboard/PageHeader';
import Toast from '@/components/Toast';

export default function ReviewsPage() {
  const t = useTranslations('pages.dashboard.reviews');
  const tBase = useTranslations('pages.dashboard');
  const locale = useLocale();

  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    const res = await getPendingReviews();
    setItems(res.status && Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id: number) => {
    setProcessing(id);
    const res = await approveReview(id);
    setProcessing(null);
    if (res.status) {
      setItems((prev) => prev.filter((r) => r.id !== id));
      showToast(t('approved'), 'success');
    } else {
      showToast(res.message || tBase('error'), 'error');
    }
  };

  const handleReject = async (id: number) => {
    setProcessing(id);
    const res = await rejectReview(id);
    setProcessing(null);
    if (res.status) {
      setItems((prev) => prev.filter((r) => r.id !== id));
      showToast(t('rejected'), 'success');
    } else {
      showToast(res.message || tBase('error'), 'error');
    }
  };

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      {loading ? (
        <div className="bg-white border border-[var(--color-border-light)] rounded-xl p-12 text-center text-sm text-[var(--color-text-muted)]">
          {tBase('loading')}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-[var(--color-border-light)] rounded-xl p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-bg-accent)] mx-auto mb-4 flex items-center justify-center text-[var(--color-accent-dark)]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {t('noItems')}
          </h3>
          <p className="text-sm text-[var(--color-text-light)]">{t('noItemsDesc')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((review) => (
            <div key={review.id} className="bg-white border border-[var(--color-border-light)] rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                  {review.user?.name?.charAt(0).toUpperCase() || '?'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text)]">{review.user?.name || '—'}</p>
                      <p className="text-xs text-[var(--color-text-muted)]" dir="ltr">
                        {new Date(review.created_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <svg
                          key={n} width="16" height="16" viewBox="0 0 24 24"
                          fill={n <= review.rating ? '#F59E0B' : 'none'}
                          stroke={n <= review.rating ? '#F59E0B' : 'var(--color-border)'}
                          strokeWidth="1.5"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                  </div>

                  {review.product && (
                    <div className="flex items-center gap-2 mb-3 p-2 bg-[var(--color-bg-warm)] rounded-lg">
                      <div className="w-8 h-8 rounded bg-white overflow-hidden border border-[var(--color-border-light)] shrink-0">
                        {review.product.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={review.product.image} alt={review.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-[var(--color-text-light)] truncate">{review.product.name}</span>
                    </div>
                  )}

                  {review.comment && (
                    <p className="text-sm text-[var(--color-text)] leading-relaxed mb-4">{review.comment}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(review.id)}
                      disabled={processing === review.id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-bg-accent)] text-[var(--color-accent-dark)] text-sm font-medium rounded-lg hover:bg-[var(--color-accent)] hover:text-white transition-colors disabled:opacity-50"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {t('approve')}
                    </button>
                    <button
                      onClick={() => handleReject(review.id)}
                      disabled={processing === review.id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      {t('reject')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}
