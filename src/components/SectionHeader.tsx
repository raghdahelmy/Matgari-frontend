'use client';

import RevealOnScroll from './RevealOnScroll';

interface Props {
  eyebrow: string;
  title1: string;
  title2: string;
  subtitle?: string;
}

export default function SectionHeader({ eyebrow, title1, title2, subtitle }: Props) {
  return (
    <RevealOnScroll className="text-center max-w-[620px] mx-auto mb-[clamp(48px,6vw,80px)]">
      <span className="inline-block text-xs font-medium tracking-[0.15em] uppercase text-[var(--color-accent-dark)] mb-4">
        {eyebrow}
      </span>
      <h2
        className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.2] text-[var(--color-text)] tracking-tight mb-4"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {title1}
        <br />
        <em className="text-[var(--color-accent-dark)]">{title2}</em>
      </h2>
      {subtitle && (
        <p className="text-base leading-relaxed text-[var(--color-text-light)]">{subtitle}</p>
      )}
    </RevealOnScroll>
  );
}
