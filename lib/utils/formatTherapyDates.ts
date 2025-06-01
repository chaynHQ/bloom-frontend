import { format, formatRelative, Locale } from 'date-fns';

export const formatDateDetails = (
  date: Date | null,
  isValidDate: boolean,
  locale: Locale,
): string | null => {
  if (!isValidDate || !date) {
    return null;
  }
  return format(date, 'EEEE do MMMM yyyy', { locale });
};

export const formatTimeRange = (
  startDate: Date | null,
  endDate: Date | null,
  isValidStart: boolean,
  isValidEnd: boolean,
  locale: Locale,
  timezone: string,
): string | null => {
  if (!isValidStart || !isValidEnd || !startDate || !endDate) {
    return null;
  }
  const startTime = format(startDate, 'p', { locale });
  const endTime = format(endDate, 'p', { locale });
  return `${startTime} - ${endTime} (${timezone})`;
};

export const formatHeaderDateTime = (
  date: Date | null,
  now: Date,
  isValidDate: boolean,
  locale: Locale,
  status: string,
): string | null => {
  if (!isValidDate || !date) {
    return null;
  }

  const daysDifference = differenceInDays(date, now);

  if (status === 'upcoming') {
    if (daysDifference <= 1) {
      return formatRelative(date, now, { locale });
    } else if (daysDifference <= 6) {
      const relativeDay = formatRelative(date, now, { locale }).split(' at ')[0];
      const specificTime = format(date, 'p', { locale });
      const specificDate = format(date, 'do MMM', { locale });
      return `${relativeDay} (${specificDate}) at ${specificTime}`;
    } else {
      return format(date, `EEEE do MMMM 'at' p`, { locale });
    }
  } else {
    return format(date, 'do MMMM yyyy', { locale });
  }
};

export const formatDialogDateTime = (
  date: Date | null,
  isValidDate: boolean,
  locale: Locale,
): string | null => {
  if (!isValidDate || !date) {
    return null;
  }
  return format(date, 'EEEE do MMMM yyyy, p', { locale });
};

function differenceInDays(dateLeft: Date, dateRight: Date): number {
  const startOfDayLeft = new Date(dateLeft.getFullYear(), dateLeft.getMonth(), dateLeft.getDate());
  const startOfDayRight = new Date(
    dateRight.getFullYear(),
    dateRight.getMonth(),
    dateRight.getDate(),
  );

  const diff = startOfDayLeft.getTime() - startOfDayRight.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}
