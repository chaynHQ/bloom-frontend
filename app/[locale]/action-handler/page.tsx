'use client';

import { redirect } from '@/i18n/routing';
import { confirmEmailVerified } from '@/lib/auth';
import { useAppDispatch } from '@/lib/hooks/store';
import { setUserVerifiedEmail } from '@/lib/store/userSlice';
import { fullScreenContainerStyle } from '@/styles/common';
import { Container, Typography } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useLocale } from 'next-intl';
import { notFound, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

// Page to handle redirects from external tools. E.g. firebase auth emails redirect to /action-handler?mode=resetPassword&oobCode....
export default function Page() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const dispatch: any = useAppDispatch();
  const rollbar = useRollbar();

  const modeParam = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');
  const [error, setError] = useState<string>();

  useEffect(() => {
    const handleEmailVerified = async () => {
      if (!oobCode) {
        throw new Error('No oobCode provided with verify email link');
      }
      const { success, error } = await confirmEmailVerified(oobCode);

      if (success) {
        await dispatch(setUserVerifiedEmail(true));

        redirect({
          href: '/auth/login',
          // @ts-ignore
          locale,
        });
      } else {
        rollbar.error('Failed to confirm email verification', error || ': Error undefined');
        // This is currently only shown to super admin team members
        setError(`There was an issue completing that request: ${error}`);
      }
    };

    if (modeParam && modeParam === 'verifyEmail') {
      handleEmailVerified();
    }
  }, [modeParam, oobCode, dispatch, locale, rollbar]);

  if (error) {
    return (
      <Container sx={fullScreenContainerStyle}>
        <Typography>{error}</Typography>
      </Container>
    );
  }
  if (modeParam && modeParam === 'resetPassword') {
    redirect({
      href: '/auth/reset-password',
      // @ts-ignore
      query: { oobCode },
      locale,
    });
  } else if (modeParam && modeParam === 'verifyEmail') {
    return <></>;
  } else {
    rollbar.error('Invalid action handler request');
    notFound();
  }
}
