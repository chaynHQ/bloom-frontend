'use client';

import { useRouter } from '@/i18n/routing';
import { notFound, redirect, useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Page to handle redirects from external tools. E.g. firebase auth emails redirect to /action-handler?mode=resetPassword&oobCode....
export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  let modeParam = searchParams.get('mode');

  if (modeParam && modeParam === 'resetPassword') {
    redirect(`/auth/reset-password?oobCode=${searchParams.get('oobCode')}`);
  } else {
    notFound();
  }
}
