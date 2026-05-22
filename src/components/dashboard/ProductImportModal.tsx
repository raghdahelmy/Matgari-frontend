'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { importProducts, downloadProductsFile, type ImportResult } from '@/lib/tenantApi';
import Toast from '../Toast';

interface Props {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

export default function ProductImportModal({ open, onClose, onImported }: Props) {
  const t = useTranslations('pages.dashboard.products.import');
  const tc = useTranslations('pages.dashboard.common');

  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [downloading, setDownloading] = useState<'export' | 'template' | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  if (!open) return null;

  const handleDownload = async (kind: 'export' | 'template') => {
    setDownloading(kind);
    const res = await downloadProductsFile(kind);
    setDownloading(null);

    if (res.ok && res.blobUrl) {
      const a = document.createElement('a');
      a.href = res.blobUrl;
      a.download = res.filename || `products-${kind}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(res.blobUrl);
    } else {
      showToast(res.message || t('failed'), 'error');
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setResult(null);
    const res = await importProducts(file);
    setImporting(false);

    if (res.status && res.data) {
      setResult(res.data);
      onImported();
      if (res.data.errors.length === 0) {
        showToast(
          t('result', { imported: res.data.imported, skipped: res.data.skipped }),
          'success'
        );
      }
    } else {
      showToast(res.message || t('failed'), 'error');
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-[var(--color-bg-dark)]/50 backdrop-blur-sm"
        onClick={handleClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-[var(--color-border-light)] flex items-start justify-between gap-3">
            <div>
              <h2
                className="text-xl font-semibold text-[var(--color-text)]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {t('title')}
              </h2>
              <p className="text-sm text-[var(--color-text-light)] mt-0.5">{t('subtitle')}</p>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg-warm)] flex items-center justify-center shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleDownload('template')}
                disabled={downloading !== null}
                className="bg-[var(--color-bg-accent)] hover:bg-[var(--color-accent-light)] border-2 border-[var(--color-accent-light)] hover:border-[var(--color-accent)] rounded-xl p-4 text-start transition-all disabled:opacity-50"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white text-[var(--color-accent-dark)] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <polyline points="9 15 12 18 15 15" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text)] mb-0.5">
                      {downloading === 'template' ? '...' : t('downloadTemplate')}
                    </p>
                    <p className="text-xs text-[var(--color-text-light)]">{t('downloadTemplateDesc')}</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleDownload('export')}
                disabled={downloading !== null}
                className="bg-white hover:bg-[var(--color-bg-warm)] border-2 border-[var(--color-border)] hover:border-[var(--color-text-light)] rounded-xl p-4 text-start transition-all disabled:opacity-50"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-warm)] text-[var(--color-text)] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text)] mb-0.5">
                      {downloading === 'export' ? '...' : t('exportAll')}
                    </p>
                    <p className="text-xs text-[var(--color-text-light)]">{t('exportDesc')}</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-[var(--color-bg-warm)]/60 border border-[var(--color-border-light)] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[var(--color-text)] mb-2">{t('instructionsTitle')}</h3>
              <ol className="space-y-1.5 text-sm text-[var(--color-text-light)] list-decimal list-inside">
                <li>{t('step1')}</li>
                <li>{t('step2')}</li>
                <li>{t('step3')}</li>
                <li>{t('step4')}</li>
              </ol>
            </div>

            {/* Upload */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                {t('uploadFile')}
              </label>
              <div className="border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] rounded-xl p-5 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    setResult(null);
                  }}
                  className="hidden"
                  id="excel-upload"
                />
                <label htmlFor="excel-upload" className="flex items-center gap-3 cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-bg-accent)] text-[var(--color-accent-dark)] flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    {file ? (
                      <>
                        <p className="text-sm font-medium text-[var(--color-text)] truncate">
                          {t('selected')} {file.name}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)]">{(file.size / 1024).toFixed(1)} KB</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-[var(--color-text)]">{t('selectFile')}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{t('uploadHint')}</p>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Result */}
            {result && (
              <div className={`rounded-xl p-4 border ${result.errors.length === 0 ? 'bg-[var(--color-bg-accent)] border-[var(--color-accent)]' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center ${result.errors.length === 0 ? 'bg-[var(--color-success)] text-white' : 'bg-amber-500 text-white'}`}>
                    {result.errors.length === 0 ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[var(--color-text)] mb-1">
                      {result.errors.length === 0 ? t('successTitle') : t('errorsTitle')}
                    </p>
                    <p className="text-sm text-[var(--color-text-light)]">
                      {t('result', { imported: result.imported, skipped: result.skipped })}
                    </p>
                    {result.errors.length > 0 && (
                      <ul className="mt-2 text-xs text-amber-800 space-y-0.5 max-h-32 overflow-y-auto list-disc list-inside">
                        {result.errors.slice(0, 20).map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                        {result.errors.length > 20 && (
                          <li className="opacity-60">… +{result.errors.length - 20}</li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[var(--color-border-light)] flex justify-end gap-3">
            <button onClick={handleClose} className="btn btn-ghost">{tc('cancel')}</button>
            <button
              onClick={handleImport}
              disabled={!file || importing}
              className="btn btn-primary"
            >
              {importing ? t('importing') : t('startImport')}
            </button>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}
