// Hermes may ship without Intl.PluralRules, and i18next needs it to choose between
// `_one`, `_few`, `_many`, `_other`. This fills the gap for the languages the app has; it
// does nothing when the engine already provides the API.
type Category = 'one' | 'few' | 'many' | 'other';

const rules: Record<string, (n: number) => Category> = {
  en: (n) => (n === 1 ? 'one' : 'other'),
  ru: (n) => {
    if (!Number.isInteger(n)) return 'other';
    const d = n % 10;
    const h = n % 100;
    if (d === 1 && h !== 11) return 'one';
    if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return 'few';
    return 'many';
  },
};

const categories: Record<string, Category[]> = {
  en: ['one', 'other'],
  ru: ['one', 'few', 'many', 'other'],
};

class PluralRulesFallback {
  private lang: string;
  constructor(locale?: string | string[]) {
    const first = Array.isArray(locale) ? locale[0] : locale;
    const base = (first ?? 'en').split('-')[0];
    this.lang = base in rules ? base : 'en';
  }
  select(n: number): Category {
    return rules[this.lang](Math.abs(n));
  }
  resolvedOptions() {
    return { locale: this.lang, pluralCategories: categories[this.lang] };
  }
  static supportedLocalesOf(locales: string | string[]) {
    return ([] as string[]).concat(locales).filter((l) => l.split('-')[0] in rules);
  }
}

export const ensurePluralRules = () => {
  const intl = globalThis.Intl as unknown as Record<string, unknown> | undefined;
  if (intl && typeof intl.PluralRules !== 'function') intl.PluralRules = PluralRulesFallback;
};
