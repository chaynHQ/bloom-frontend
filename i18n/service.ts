'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { COOKIE_LOCALE_NAME, Locale, defaultLocale } from './config';

// In this example the locale is read from a cookie. You could alternatively
// also read it from a database, backend service, or any other source.
export async function getUserLocale() {
  return cookies().get(COOKIE_LOCALE_NAME)?.value || defaultLocale;
}

export async function setUserLocale(locale: Locale, path: string = '/') {
  cookies().set(COOKIE_LOCALE_NAME, locale);

  revalidatePath(path);
}
