import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useState } from 'react';
import { auth } from '../config/firebase';
import rollbar from '../config/rollbar';
import {
  RESET_PASSWORD_ERROR,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
} from '../constants/events';
import logEvent from '../utils/logEvent';

export const EmailForm = () => {
  const [emailInput, setEmailInput] = useState<string>('');
  const [resetEmailSent, setResetEmailSent] = useState<boolean>(false);
  const [formError, setFormError] = useState<
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();
  const t = useTranslations('Auth.form');

  const actionCodeSettings = {
    url: 'http://localhost:3000/reset-password',
    handleCodeInApp: true,
  };

  const sendResetEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    logEvent(RESET_PASSWORD_REQUEST);

    auth
      .sendPasswordResetEmail(emailInput, actionCodeSettings)
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
    <form autoComplete="off" onSubmit={sendResetEmailSubmit}>
      <TextField
        id="email"
        onChange={(e) => setEmailInput(e.target.value)}
        label={t.rich('emailLabel')}
        variant="standard"
        fullWidth
        required
      />
      {formError && (
        <Typography variant="body1" component="p" color="error.main" mb={2}>
          {formError}
        </Typography>
      )}

      <Button sx={{ mt: 2, mr: 1.5 }} variant="contained" fullWidth color="secondary" type="submit">
        {t.rich('resetPasswordSubmit')}
      </Button>
      {resetEmailSent && (
        <Box>
          <Typography variant="body1" component="p" color="error.main" mb={2}>
            {t.rich('resetEmailSent')}
          </Typography>
          <Button
            sx={{ mt: 2, mr: 1.5 }}
            variant="contained"
            fullWidth
            color="secondary"
            type="submit"
          >
            {t.rich('resetPasswordSubmit')}
          </Button>
        </Box>
      )}
    </form>
  );
};

export const PasswordForm = (codeParam: string) => {
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [formError, setFormError] = useState<
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();

  const t = useTranslations('Auth.form');
  const resetPasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {};

  return (
    <form autoComplete="off" onSubmit={resetPasswordSubmit}>
      <TextField
        id="password"
        onChange={(e) => setPasswordInput(e.target.value)}
        label={t.rich('passwordLabel')}
        type="password"
        variant="standard"
        fullWidth
        required
      />
      {formError && (
        <Typography variant="body1" component="p" color="error.main" mb={2}>
          {formError}
        </Typography>
      )}

      <Button sx={{ mt: 2, mr: 1.5 }} variant="contained" fullWidth color="secondary" type="submit">
        {codeParam ? t.rich('resetPasswordSubmit') : t.rich('resetPasswordSubmit')}
      </Button>
    </form>
  );
};
