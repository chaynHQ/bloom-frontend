'use client';

import { redirect } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { notFound, useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Page to handle redirects from external tools. E.g. firebase auth emails redirect to /action-handler?mode=resetPassword&oobCode....
export default function Page() {
  const searchParams = useSearchParams();
  const locale = useLocale();

  let modeParam = searchParams.get('mode');

  if (modeParam && modeParam === 'resetPassword') {
    redirect({
      href: '/auth/reset-password',
      // @ts-ignore
      query: { oobCode: searchParams.get('oobCode') },
      locale,
    });
  } else {
    notFound();
  }
}
