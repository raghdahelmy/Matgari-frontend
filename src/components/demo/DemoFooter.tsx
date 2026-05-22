'use client';

interface Props {
  locale: string;
  t: (key: string) => string;
}

export default function DemoFooter({ locale, t }: Props) {
  return (
    <footer className="bg-white pt-16 pb-8 border-t border-[var(--color-border-light)]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] flex items-center justify-center text-white text-sm font-bold">
                L
              </span>
              <span
                className="text-2xl font-semibold tracking-tight text-[var(--color-text)]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                LUMA
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-light)] leading-relaxed mb-5 max-w-[280px]">
              {t('footer.tagline')}
            </p>
            <div className="flex gap-3">
              {['instagram', 'facebook', 'twitter'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-light)] hover:bg-[var(--color-bg-dark)] hover:text-white hover:border-[var(--color-bg-dark)] transition-all"
                  aria-label={social}
                >
                  <SocialIcon name={social} />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn
            title={t('footer.shop')}
            links={[
              { label: t('footer.all'), href: '#' },
              { label: t('footer.new'), href: '#' },
              { label: t('footer.bestSellers'), href: '#' },
              { label: t('footer.sale'), href: '#' },
            ]}
          />

          <FooterColumn
            title={t('footer.company')}
            links={[
              { label: t('footer.story'), href: '#' },
              { label: t('footer.stores'), href: '#' },
              { label: t('footer.blog'), href: '#' },
            ]}
          />

          <FooterColumn
            title={t('footer.support')}
            links={[
              { label: t('footer.shipping'), href: '#' },
              { label: t('footer.returns'), href: '#' },
              { label: t('footer.faq'), href: '#' },
            ]}
          />
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-[var(--color-border-light)] flex items-center justify-between flex-wrap gap-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            &copy; 2026 LUMA. {t('footer.rights')}
          </p>
          <a
            href={`/${locale}`}
            className="text-xs text-[var(--color-accent-dark)] hover:text-[var(--color-accent)] flex items-center gap-1.5"
          >
            <span>Powered by</span>
            <strong style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Mat<span className="text-[var(--color-accent)]">gari</span>
            </strong>
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-5 text-[var(--color-text)]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        {title}
      </h4>
      <ul className="space-y-2.5 list-none">
        {links.map((link) => (
          <li key={link.label}>
            <a href={link.href} className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-text)] transition-colors">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({ name }: { name: string }) {
  if (name === 'instagram') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" />
      </svg>
    );
  }
  if (name === 'facebook') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 12a10 10 0 10-11.55 9.88v-7H8v-2.88h2.45V9.65c0-2.4 1.45-3.74 3.6-3.74 1.04 0 2.13.18 2.13.18V8.5h-1.27c-1.25 0-1.66.78-1.66 1.58v1.92h2.86l-.46 2.88h-2.4v7A10 10 0 0022 12z" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}
