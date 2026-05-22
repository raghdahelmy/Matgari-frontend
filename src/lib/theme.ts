/**
 * Theme presets + helpers for customer-facing storefronts.
 * Vendors save their choice as plain store_settings keys
 * (theme_preset, theme_primary, theme_dark, theme_font).
 * The Storefront layout reads them and injects CSS variables.
 */

export interface ThemePreset {
  key: string;
  name: { ar: string; en: string };
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  bgWarm: string;
  bgAccent: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    key: 'emerald',
    name: { ar: 'إيمرالد (افتراضي)', en: 'Emerald (default)' },
    primary: '#00A878',
    primaryDark: '#00875A',
    primaryLight: '#4ADE80',
    accent: '#052E2B',
    bgWarm: '#ECF5F0',
    bgAccent: '#DCFCE7',
  },
  {
    key: 'navy',
    name: { ar: 'كحلي', en: 'Navy' },
    primary: '#3B82F6',
    primaryDark: '#1E40AF',
    primaryLight: '#60A5FA',
    accent: '#0F172A',
    bgWarm: '#EFF6FF',
    bgAccent: '#DBEAFE',
  },
  {
    key: 'rose',
    name: { ar: 'وردي', en: 'Rose' },
    primary: '#E11D48',
    primaryDark: '#9F1239',
    primaryLight: '#FB7185',
    accent: '#1F0B14',
    bgWarm: '#FFF1F2',
    bgAccent: '#FFE4E6',
  },
  {
    key: 'amber',
    name: { ar: 'كهرماني', en: 'Amber' },
    primary: '#F59E0B',
    primaryDark: '#B45309',
    primaryLight: '#FCD34D',
    accent: '#1C1810',
    bgWarm: '#FFFBEB',
    bgAccent: '#FEF3C7',
  },
  {
    key: 'purple',
    name: { ar: 'بنفسجي', en: 'Purple' },
    primary: '#8B5CF6',
    primaryDark: '#6D28D9',
    primaryLight: '#A78BFA',
    accent: '#1E1B2E',
    bgWarm: '#F5F3FF',
    bgAccent: '#EDE9FE',
  },
  {
    key: 'coral',
    name: { ar: 'مرجاني', en: 'Coral' },
    primary: '#F97316',
    primaryDark: '#C2410C',
    primaryLight: '#FB923C',
    accent: '#1C140D',
    bgWarm: '#FFF7ED',
    bgAccent: '#FFEDD5',
  },
];

export interface FontOption {
  key: string;
  name: { ar: string; en: string };
  cssFamily: string;
  googleFont?: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { key: 'tajawal',  name: { ar: 'تجوال (افتراضي)', en: 'Tajawal (default)' }, cssFamily: "'Tajawal', sans-serif", googleFont: 'Tajawal:wght@300;400;500;700;800' },
  { key: 'cairo',    name: { ar: 'القاهرة', en: 'Cairo' }, cssFamily: "'Cairo', sans-serif", googleFont: 'Cairo:wght@300;400;500;700;800' },
  { key: 'almarai',  name: { ar: 'المراعي', en: 'Almarai' }, cssFamily: "'Almarai', sans-serif", googleFont: 'Almarai:wght@300;400;700;800' },
  { key: 'ibmplex',  name: { ar: 'IBM Plex Arabic', en: 'IBM Plex Sans Arabic' }, cssFamily: "'IBM Plex Sans Arabic', sans-serif", googleFont: 'IBM+Plex+Sans+Arabic:wght@300;400;500;600;700' },
  { key: 'amiri',    name: { ar: 'الأميري (Serif)', en: 'Amiri (Serif)' }, cssFamily: "'Amiri', serif", googleFont: 'Amiri:wght@400;700' },
];

export interface StoreTheme {
  preset: ThemePreset;
  font: FontOption;
}

export function resolveTheme(settings: Record<string, string | null | undefined>): StoreTheme {
  const presetKey = settings.theme_preset || 'emerald';
  const fontKey = settings.theme_font || 'tajawal';

  // Allow fully custom colors (override the preset values)
  const preset: ThemePreset = (() => {
    const base = THEME_PRESETS.find((p) => p.key === presetKey) || THEME_PRESETS[0];
    if (presetKey === 'custom') {
      return {
        ...base,
        key: 'custom',
        primary: settings.theme_primary || base.primary,
        primaryDark: settings.theme_primary_dark || base.primaryDark,
        accent: settings.theme_accent || base.accent,
      };
    }
    return base;
  })();

  const font = FONT_OPTIONS.find((f) => f.key === fontKey) || FONT_OPTIONS[0];

  return { preset, font };
}

/**
 * Build the inline <style> block that overrides the storefront CSS variables.
 * Embed this in the storefront layout.
 */
export function themeCssVars(theme: StoreTheme): string {
  const p = theme.preset;
  return `
    .store-theme {
      --color-accent: ${p.primary};
      --color-accent-dark: ${p.primaryDark};
      --color-accent-light: ${p.primaryLight};
      --color-bg-dark: ${p.accent};
      --color-bg-warm: ${p.bgWarm};
      --color-bg-accent: ${p.bgAccent};
      font-family: ${theme.font.cssFamily};
    }
  `.trim();
}

/**
 * Build the Google Fonts <link> URL for the chosen font.
 */
export function themeFontLink(theme: StoreTheme): string | null {
  if (!theme.font.googleFont) return null;
  return `https://fonts.googleapis.com/css2?family=${theme.font.googleFont}&display=swap`;
}
