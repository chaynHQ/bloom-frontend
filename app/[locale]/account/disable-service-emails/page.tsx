'use client';

import Header from '@/components/layout/Header';
import { useUpdateUserMutation } from '@/lib/api';
import { ErrorDisplay, FEEDBACK_FORM_URL } from '@/lib/constants/common';
import { USER_DISABLED_SERVICE_EMAILS } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent from '@/lib/utils/logEvent';
import illustrationPerson5Yellow from '@/public/illustration_leaf_mix_bee.svg';
import { Box, Container, Link, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function Page() {
  const t = useTranslations('Account.disableServiceEmails');

  const userServiceEmailsPermission = useTypedSelector(
    (state) => state.user.serviceEmailsPermission,
  );
  const [error, setError] = useState<ErrorDisplay>();
  const [updateUser, { isLoading: updateUserIsLoading }] = useUpdateUserMutation();

  useEffect(() => {
    if (userServiceEmailsPermission === true) {
      try {
        updateUser({ serviceEmailsPermission: false });
        logEvent(USER_DISABLED_SERVICE_EMAILS);
      } catch (error) {
        setError(
          t.rich('error', {
            link: (content) => (
              <Link target="_blank" href={FEEDBACK_FORM_URL}>
                {content}
              </Link>
            ),
          }),
        );
      }
    }
  }, []);

  const headerProps = {
    title: t('title'),
    introduction: t.rich('description', {
      link: (content) => (
        <Link target="_blank" href={FEEDBACK_FORM_URL}>
          {content}
        </Link>
      ),
    }),
    imageSrc: illustrationPerson5Yellow,
    translatedImageAlt: t('imageAlt'),
  };

  return (
    <Box>
      <Head>
        <title>{`${t('title')} • Bloom`}</title>
      </Head>
      {error && (
        <Container>
          <Typography>{error}</Typography>
        </Container>
      )}
      {!error && !updateUserIsLoading && (
        <Header
          title={headerProps.title}
          introduction={headerProps.introduction}
          imageSrc={headerProps.imageSrc}
          translatedImageAlt={headerProps.translatedImageAlt}
        />
      )}
    </Box>
  );
}
