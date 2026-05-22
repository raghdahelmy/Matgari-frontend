'use client';

import type { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
}

export default function FormSection({ title, description, children }: Props) {
  return (
    <div className="bg-white border border-[var(--color-border-light)] rounded-xl p-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
      <div>
        <h3
          className="text-base font-semibold text-[var(--color-text)] mb-1"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {title}
        </h3>
        {description && (
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function FormField({
  label,
  hint,
  children,
  required,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
        {label}
        {required && <span className="text-[var(--color-error)] ms-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-[var(--color-text-muted)] mt-1">{hint}</p>}
    </div>
  );
}

export const inputCls =
  'w-full px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[rgba(0,168,120,0.15)] transition-all';
