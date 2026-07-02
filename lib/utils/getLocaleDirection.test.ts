import { getLocaleDirection, isRtlLocale, RTL_LOCALES } from './getLocaleDirection';

describe('getLocaleDirection', () => {
  it('returns rtl for Arabic', () => {
    expect(getLocaleDirection('ar')).toBe('rtl');
  });

  it('returns ltr for Turkish (Turkish is left-to-right)', () => {
    expect(getLocaleDirection('tr')).toBe('ltr');
  });

  it.each(['en', 'de', 'fr', 'es', 'pt', 'hi'])('returns ltr for %s', (locale) => {
    expect(getLocaleDirection(locale)).toBe('ltr');
  });

  it('defaults to ltr for unknown/empty locales', () => {
    expect(getLocaleDirection('')).toBe('ltr');
    expect(getLocaleDirection('xx')).toBe('ltr');
  });

  it('only lists Arabic as RTL', () => {
    expect(RTL_LOCALES).toEqual(['ar']);
  });

  it('isRtlLocale mirrors getLocaleDirection', () => {
    expect(isRtlLocale('ar')).toBe(true);
    expect(isRtlLocale('tr')).toBe(false);
    expect(isRtlLocale('en')).toBe(false);
  });
});
