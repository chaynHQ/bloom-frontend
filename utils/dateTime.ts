import { DateTimeFormatOptions } from 'next-intl';

const options: DateTimeFormatOptions = {
  weekday: undefined,
  year: undefined,
  month: 'long',
  day: 'numeric',
};

export const formatDateToString = (date: Date | string, locale: string): string => {
  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString(locale, options);
  } else {
    return date.toLocaleDateString(locale, options);
  }
};
