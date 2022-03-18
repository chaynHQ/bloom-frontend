import LoadingButton from '@mui/lab/LoadingButton';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useState } from 'react';
import { auth } from '../../config/firebase';
import rollbar from '../../config/rollbar';
import {
  RESET_PASSWORD_ERROR,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
} from '../../constants/events';
import logEvent from '../../utils/logEvent';
import Link from '../common/Link';

export const EmailForm = () => {
  const [emailInput, setEmailInput] = useState<string>('');
  const [resetEmailSent, setResetEmailSent] = useState<boolean>(false);
  const [formError, setFormError] = useState<
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();
  const t = useTranslations('Auth.form');

  const sendResetEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    logEvent(RESET_PASSWORD_REQUEST);

    auth
      .sendPasswordResetEmail(emailInput)
      .then(() => {
        logEvent(RESET_PASSWORD_SUCCESS);
        setResetEmailSent(true);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        logEvent(RESET_PASSWORD_ERROR, { message: errorCode });
        rollbar.error('User reset password firebase error', error);

        if (errorCode === 'auth/invalid-email') {
          setFormError(t('firebase.invalidEmail'));
        }
        if (errorCode === 'auth/user-not-found') {
          setFormError(t('firebase.authError'));
        }
      });
  };
  return (
    <Box>
      <Typography mb={2}>{t('resetPasswordStep1')}</Typography>
      <form autoComplete="off" onSubmit={sendResetEmailSubmit}>
        <TextField
          id="email"
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
  const [formError, setFormError] = useState<
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();

  const [formSuccess, setFormSuccess] = useState<boolean>(false);

  const t = useTranslations('Auth.form');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    auth
      .confirmPasswordReset(codeParam, passwordInput)
      .then(() => {
        setFormSuccess(true);
        setLoading(false);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        logEvent(RESET_PASSWORD_ERROR, { message: errorCode });
        rollbar.error('User reset password firebase error', error);

        if (errorCode === 'auth/weak-password') {
          setFormError(t('firebase.weakPassword'));
        } else if (errorCode === 'auth/expired-action-code') {
          setFormError(
            t.rich('firebase.expiredCode', {
              resetLink: (children) => <Link href="/auth/reset-password">{children}</Link>,
            }),
          );
        } else {
          setFormError(
            t.rich('firebase.invalidCode', {
              resetLink: (children) => <Link href="/auth/reset-password">{children}</Link>,
            }),
          );
        }
        setLoading(false);
      });
  };

  if (formSuccess) {
    return (
      <Box>
        <Typography mb={2}>{t('passwordResetSuccess')}</Typography>
        <Button
          sx={{ mt: 2, mr: 1.5 }}
          variant="contained"
          component={Link}
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
          loadingPosition="end"
        >
          {codeParam ? t('resetPasswordSubmit') : t('resetPasswordSubmit')}
        </LoadingButton>
      </form>
    </Box>
  );
};
