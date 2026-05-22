import MarketingLayout from './MarketingLayout';
import RevealOnScroll from './RevealOnScroll';

interface Section {
  title: string;
  body: string;
}

interface Props {
  title: string;
  intro: string;
  sections: Section[];
  lastUpdated: string;
}

export default function LegalPage({ title, intro, sections, lastUpdated }: Props) {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative pt-40 pb-12 overflow-hidden">
        <div className="absolute -top-[200px] -end-[200px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,168,120,0.10)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <RevealOnScroll>
            <h1
              className="text-[clamp(2.2rem,4vw,3.2rem)] font-semibold text-[var(--color-text)] mb-4 tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {title}
            </h1>
            <p className="text-base text-[var(--color-text-light)] leading-relaxed mb-3">
              {intro}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-[0.2em]">
              {lastUpdated}
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24">
        <div className="max-w-[800px] mx-auto px-6">
          <RevealOnScroll>
            <div className="bg-white rounded-[24px] border border-[var(--color-border-light)] p-8 md:p-12 space-y-8">
              {sections.map((section, i) => (
                <div key={i} className={i > 0 ? 'pt-8 border-t border-[var(--color-border-light)]' : ''}>
                  <div className="flex items-baseline gap-3 mb-3">
                    <span
                      className="text-sm text-[var(--color-accent-dark)] font-semibold"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h2
                      className="text-xl md:text-2xl font-semibold text-[var(--color-text)]"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-[var(--color-text-light)] leading-relaxed text-[0.95rem] ms-9">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </MarketingLayout>
  );
}
