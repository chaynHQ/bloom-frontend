'use client';

import { useContactDialog } from '@/components/contact/ContactDialogProvider';
import Header from '@/components/layout/Header';
import { useUpdateUserMutation } from '@/lib/api';
import { ErrorDisplay } from '@/lib/constants/common';
import { USER_DISABLED_SERVICE_EMAILS } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent from '@/lib/utils/logEvent';
import illustrationPerson5Yellow from '@/public/illustration_leaf_mix_bee.svg';
import { Box, Container, Link, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

export default function DisableServiceEmailsPage() {
  const t = useTranslations('Account.disableServiceEmails');

  const userServiceEmailsPermission = useTypedSelector(
    (state) => state.user.serviceEmailsPermission,
  );
  const [error, setError] = useState<ErrorDisplay>();
  const [updateUser, { isLoading: updateUserIsLoading }] = useUpdateUserMutation();
  const { open: openContactDialog } = useContactDialog();

  // Track if we've already attempted to disable emails
  const hasAttemptedDisable = useRef(false);

  useEffect(() => {
    if (userServiceEmailsPermission === true && !hasAttemptedDisable.current) {
      hasAttemptedDisable.current = true;
      updateUser({ serviceEmailsPermission: false })
        .then(() => {
          logEvent(USER_DISABLED_SERVICE_EMAILS);
        })
        .catch(() => {
          setError(
            t.rich('error', {
              link: (content) => (
                <Link
                  component="button"
                  type="button"
                  onClick={() => openContactDialog({ type: 'bug', source: 'disable_emails_error' })}
                >
                  {content}
                </Link>
              ),
            }),
          );
        });
    }
  }, [userServiceEmailsPermission, updateUser, t, openContactDialog]);

  const headerProps = {
    title: t('title'),
    introduction: t.rich('description', {
      link: (content) => (
        <Link
          component="button"
          type="button"
          onClick={() => openContactDialog({ type: 'contact', source: 'disable_emails' })}
        >
          {content}
        </Link>
      ),
    }),
    imageSrc: illustrationPerson5Yellow,
    translatedImageAlt: t('imageAlt'),
  };

  return (
    <Box>
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
