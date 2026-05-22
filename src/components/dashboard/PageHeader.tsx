'use client';

import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function PageHeader({ title, subtitle, action }: Props) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
      <div>
        <h1
          className="text-2xl md:text-3xl font-semibold text-[var(--color-text)] mb-1"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {title}
        </h1>
        {subtitle && <p className="text-sm text-[var(--color-text-light)]">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
