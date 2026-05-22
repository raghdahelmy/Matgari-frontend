'use client';

import { useTranslations, useLocale } from 'next-intl';
import { THEME_PRESETS, FONT_OPTIONS, type ThemePreset } from '@/lib/theme';

interface Props {
  presetKey: string;
  fontKey: string;
  onPresetChange: (key: string) => void;
  onFontChange: (key: string) => void;
  storeUrl?: string | null;
}

export default function ThemeEditor({ presetKey, fontKey, onPresetChange, onFontChange, storeUrl }: Props) {
  const t = useTranslations('pages.dashboard.settings.theme');
  const locale = useLocale();

  const currentPreset = THEME_PRESETS.find((p) => p.key === presetKey) || THEME_PRESETS[0];
  const currentFont = FONT_OPTIONS.find((f) => f.key === fontKey) || FONT_OPTIONS[0];

  return (
    <div className="space-y-6">
      {/* Color presets */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">{t('preset')}</label>
        <p className="text-xs text-[var(--color-text-muted)] mb-3">{t('presetHint')}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {THEME_PRESETS.map((preset) => (
            <PresetButton
              key={preset.key}
              preset={preset}
              selected={preset.key === presetKey}
              label={preset.name[locale === 'ar' ? 'ar' : 'en']}
              onClick={() => onPresetChange(preset.key)}
            />
          ))}
        </div>
      </div>

      {/* Font */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">{t('font')}</label>
        <p className="text-xs text-[var(--color-text-muted)] mb-3">{t('fontHint')}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font.key}
              type="button"
              onClick={() => onFontChange(font.key)}
              className={`text-start p-3 rounded-xl border-2 transition-all ${
                font.key === fontKey
                  ? 'border-[var(--color-accent)] bg-[var(--color-bg-accent)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-accent-light)] bg-white'
              }`}
            >
              <p className="text-sm font-medium text-[var(--color-text)]">
                {font.name[locale === 'ar' ? 'ar' : 'en']}
              </p>
              <p
                className="text-xs text-[var(--color-text-light)] mt-1"
                style={{ fontFamily: font.cssFamily }}
              >
                Aa أبجد {locale === 'ar' ? 'عينة' : 'Sample'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Live preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-[var(--color-text)]">{t('preview')}</h3>
          {storeUrl && (
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener"
              className="text-xs text-[var(--color-accent-dark)] hover:underline"
            >
              {t('openStore')} →
            </a>
          )}
        </div>

        <div
          className="rounded-2xl overflow-hidden border border-[var(--color-border-light)]"
          style={{ fontFamily: currentFont.cssFamily }}
        >
          {/* Mock store header */}
          <div className="bg-white border-b px-5 py-3 flex items-center justify-between" style={{ borderColor: currentPreset.bgAccent }}>
            <div className="flex items-center gap-2">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                style={{ background: `linear-gradient(135deg, ${currentPreset.primary}, ${currentPreset.primaryDark})` }}
              >
                S
              </span>
              <span className="text-base font-semibold text-[var(--color-text)]">
                {locale === 'ar' ? 'متجرك' : 'Your Store'}
              </span>
            </div>
            <div className="text-xs" style={{ color: currentPreset.primaryDark }}>
              {locale === 'ar' ? 'تسوق' : 'Shop'}
            </div>
          </div>

          {/* Hero area */}
          <div className="p-8 text-center" style={{ background: currentPreset.bgWarm }}>
            <h2 className="text-2xl font-bold mb-2" style={{ color: currentPreset.accent }}>
              {t('previewTitle')}
            </h2>
            <p className="text-sm mb-4" style={{ color: currentPreset.accent, opacity: 0.7 }}>
              {t('previewText')}
            </p>
            <button
              type="button"
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-transform hover:scale-105"
              style={{ background: currentPreset.primary }}
            >
              {t('previewButton')}
            </button>
          </div>

          {/* Mock product card */}
          <div className="p-4 grid grid-cols-3 gap-3 bg-white">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div
                  className="aspect-square rounded-lg mb-2"
                  style={{ background: i === 1 ? currentPreset.bgAccent : currentPreset.bgWarm }}
                />
                <p className="text-xs font-medium" style={{ color: currentPreset.accent }}>
                  {locale === 'ar' ? 'منتج' : 'Product'} {i}
                </p>
                <p className="text-xs font-bold" style={{ color: currentPreset.primaryDark }}>
                  100 EGP
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PresetButton({
  preset,
  selected,
  label,
  onClick,
}: {
  preset: ThemePreset;
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative rounded-xl border-2 p-3 text-start transition-all ${
        selected
          ? 'border-[var(--color-text)]'
          : 'border-transparent hover:border-[var(--color-border)]'
      }`}
      style={{ background: preset.bgAccent }}
    >
      {/* Color preview swatch */}
      <div className="flex gap-1 mb-2">
        <span className="w-6 h-6 rounded-full shadow-sm" style={{ background: preset.primary }} />
        <span className="w-6 h-6 rounded-full shadow-sm" style={{ background: preset.primaryDark }} />
        <span className="w-6 h-6 rounded-full shadow-sm" style={{ background: preset.accent }} />
      </div>
      <p className="text-xs font-medium text-[var(--color-text)]">{label}</p>

      {selected && (
        <span
          className="absolute top-2 end-2 w-5 h-5 rounded-full bg-[var(--color-text)] text-white flex items-center justify-center"
          aria-hidden
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
    </button>
  );
}
