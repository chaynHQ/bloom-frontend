export const getDefaultFullSlug = (fullSlug: string, locale: string) => {
  if (locale === 'en') return fullSlug;
  const fullSlugWithoutLocale = fullSlug.slice(3);
  return `/${fullSlugWithoutLocale}`;
};
