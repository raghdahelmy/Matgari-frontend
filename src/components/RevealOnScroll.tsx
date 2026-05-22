'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function RevealOnScroll({ children, className = '', delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
