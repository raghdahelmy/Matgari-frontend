'use client';

import { useEffect, useState } from 'react';

interface Props {
  message: string;
  type: 'success' | 'error';
}

export default function Toast({ message, type }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setShow(true));
    const timer = setTimeout(() => setShow(false), 3600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="toast-container">
      <div className={`toast ${type === 'success' ? 'toast-success' : 'toast-error'} ${show ? 'show' : ''}`}>
        <span className="text-sm text-[var(--color-text)]">{message}</span>
      </div>
    </div>
  );
}
