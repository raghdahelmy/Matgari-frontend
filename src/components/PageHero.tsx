import RevealOnScroll from './RevealOnScroll';

interface Props {
  eyebrow: string;
  title: string;
  titleEm?: string;
  titleAfter?: string;
  subtitle?: string;
}

export default function PageHero({ eyebrow, title, titleEm, titleAfter, subtitle }: Props) {
  return (
    <section className="relative pt-40 pb-20 overflow-hidden">
      <div className="absolute -top-[200px] -end-[200px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,168,120,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="max-w-[900px] mx-auto px-6 text-center">
        <RevealOnScroll>
          <span className="inline-block text-xs font-medium tracking-[0.15em] uppercase text-[var(--color-accent-dark)] mb-5">
            {eyebrow}
          </span>
          <h1
            className="text-[clamp(2.5rem,5vw,4rem)] font-semibold leading-[1.15] text-[var(--color-text)] mb-6 tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {title}
            {titleEm && (
              <>
                <br />
                <em className="text-[var(--color-accent-dark)]">{titleEm}</em>
              </>
            )}
            {titleAfter && <> {titleAfter}</>}
          </h1>
          {subtitle && (
            <p className="text-lg leading-relaxed text-[var(--color-text-light)] max-w-[640px] mx-auto">
              {subtitle}
            </p>
          )}
        </RevealOnScroll>
      </div>
    </section>
  );
}
