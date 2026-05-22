'use client';

interface Props {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  variant = 'danger',
  loading = false,
}: Props) {
  if (!open) return null;

  const confirmClass =
    variant === 'danger'
      ? 'bg-[var(--color-error)] hover:bg-red-700 text-white border-[var(--color-error)]'
      : 'bg-[var(--color-bg-dark)] hover:bg-[var(--color-text)] text-white border-[var(--color-bg-dark)]';

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-[var(--color-bg-dark)]/50 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 text-[var(--color-error)] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h3
          className="text-lg font-semibold text-[var(--color-text)] mb-2"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {title}
        </h3>
        {message && <p className="text-sm text-[var(--color-text-light)] mb-5">{message}</p>}
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn btn-ghost flex-1"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`btn flex-1 border-2 ${confirmClass} disabled:opacity-50`}
          >
            {loading ? '...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
