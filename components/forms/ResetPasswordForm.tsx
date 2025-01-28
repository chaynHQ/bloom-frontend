'use client';

import { ErrorDisplay } from '@/constants/common';
import {
  RESET_PASSWORD_ERROR,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
} from '@/constants/events';
import { Link as i18nLink } from '@/i18n/routing';
import { confirmAuthPasswordReset, logout, sendAuthPasswordResetEmail } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import logEvent from '@/utils/logEvent';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button, Link, TextField, Typography } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import * as React from 'react';
import { useState } from 'react';

export const EmailForm = () => {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || 'en';
  const [emailInput, setEmailInput] = useState<string>('');
  const [resetEmailSent, setResetEmailSent] = useState<boolean>(false);
  const [formError, setFormError] = useState<
    string | React.ReactNode[] | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();
  const t = useTranslations('Auth.form');
  const rollbar = useRollbar();

  const sendResetEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    logEvent(RESET_PASSWORD_REQUEST);

    if (locale) {
      auth.languageCode = locale;
    }

    const { error } = await sendAuthPasswordResetEmail(emailInput);

    if (error) {
      const errorCode = error.code;

      if (errorCode === 'auth/invalid-email') {
        setFormError(t('firebase.invalidEmail'));
      } else if (errorCode === 'auth/user-not-found') {
        setFormError(t('firebase.authError'));
      } else {
        logEvent(RESET_PASSWORD_ERROR, { message: errorCode });
        rollbar.error('User send reset password email firebase error', error);
      }
    } else if (!error) {
      logEvent(RESET_PASSWORD_SUCCESS);
      setResetEmailSent(true);
    }
  };
  return (
    <Box>
      <Typography mb={2}>{t('resetPasswordStep1')}</Typography>
      <form autoComplete="off" onSubmit={sendResetEmailSubmit}>
        <TextField
          id="email"
          inputProps={{ 'qa-id': 'passwordResetEmailInput' }}
          onChange={(e) => setEmailInput(e.target.value)}
          label={t('emailLabel')}
          variant="standard"
          type="email"
          fullWidth
          required
        />
        {formError && (
          <Typography color="error.main" mb={2}>
            {formError}
          </Typography>
        )}

        {!resetEmailSent ? (
          <Button
            sx={{ mt: 2, mr: 1.5 }}
            variant="contained"
            fullWidth
            color="secondary"
            type="submit"
            qa-id="passwordResetEmailButton"
          >
            {t('resetPasswordSubmit')}
          </Button>
        ) : (
          <Box>
            <Typography mb={2}>{t('resetPasswordSent')}</Typography>
            <Button
              sx={{ mt: 2, mr: 1.5 }}
              variant="contained"
              fullWidth
              color="secondary"
              type="submit"
            >
              {t('resendPasswordSubmit')}
            </Button>
          </Box>
        )}
      </form>
    </Box>
  );
};

interface PasswordFormProps {
  codeParam: string;
}

export const PasswordForm = (props: PasswordFormProps) => {
  const { codeParam } = props;

  const [loading, setLoading] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [formError, setFormError] = useState<ErrorDisplay>();
  const [formSuccess, setFormSuccess] = useState<boolean>(false);

  const t = useTranslations('Auth.form');
  const rollbar = useRollbar();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const { error } = await confirmAuthPasswordReset(codeParam, passwordInput);

    if (error) {
      const errorCode = error.code;

      logEvent(RESET_PASSWORD_ERROR, { message: errorCode });
      rollbar.error('User confirm reset password firebase error', error);

      if (errorCode === 'auth/weak-password') {
        setFormError(t('firebase.weakPassword'));
      } else if (errorCode === 'auth/expired-action-code') {
        setFormError(
          t.rich('firebase.expiredCode', {
            resetLink: (children) => (
              <Link component={i18nLink} href="/auth/reset-password">
                {children}
              </Link>
            ),
          }),
        );
      } else {
        setFormError(
          t.rich('firebase.invalidCode', {
            resetLink: (children) => (
              <Link component={i18nLink} href="/auth/reset-password">
                {children}
              </Link>
            ),
          }),
        );
        setLoading(false);
        throw error;
      }
      setLoading(false);
    } else if (!error) {
      if (auth.currentUser) {
        await logout();
      }
      setFormSuccess(true);
      setLoading(false);
    }
  };

  if (formSuccess) {
    return (
      <Box>
        <Typography mb={2}>{t('passwordResetSuccess')}</Typography>
        <Button
          sx={{ mt: 2, mr: 1.5 }}
          variant="contained"
          fullWidth
          color="secondary"
          href="/auth/login"
        >
          {t('loginSubmit')}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography mb={2}>{t('resetPasswordStep2')}</Typography>
      <form autoComplete="off" onSubmit={handleSubmit}>
        <TextField
          id="password"
          onChange={(e) => setPasswordInput(e.target.value)}
          label={t('passwordLabel')}
          type="password"
          variant="standard"
          fullWidth
          required
        />
        {formError && (
          <Typography color="error.main" mb={2}>
            {formError}
          </Typography>
        )}
        <LoadingButton
          sx={{ mt: 2, mr: 1.5 }}
          variant="contained"
          fullWidth
          color="secondary"
          type="submit"
          loading={loading}
        >
          {t('resetPasswordSubmit')}
        </LoadingButton>
      </form>
    </Box>
  );
};
