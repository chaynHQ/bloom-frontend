'use client';

import Header from '@/components/layout/Header';
import { ErrorDisplay, FEEDBACK_FORM_URL } from '@/constants/common';
import { USER_DISABLED_SERVICE_EMAILS } from '@/constants/events';
import { useTypedSelector } from '@/hooks/store';
import { useUpdateUserMutation } from '@/lib/api';
import illustrationPerson5Yellow from '@/public/illustration_leaf_mix_bee.svg';
import logEvent from '@/utils/logEvent';
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
