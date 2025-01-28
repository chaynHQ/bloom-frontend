'use client';

import { FEEDBACK_FORM_URL } from '@/constants/common';
import { EVENT_LOG_NAME } from '@/constants/enums';
import {
  GET_LOGIN_USER_ERROR,
  GET_LOGIN_USER_REQUEST,
  GET_LOGIN_USER_SUCCESS,
  LOGIN_ERROR,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
} from '@/constants/events';
import { useAppDispatch, useTypedSelector } from '@/hooks/store';
import { useCreateEventLogMutation } from '@/lib/api';
import { login } from '@/lib/auth';
import { setAuthStateLoading } from '@/lib/store/userSlice';
import logEvent from '@/utils/logEvent';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Link, TextField, Typography } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useEffect, useState } from 'react';

const containerStyle = {
  marginY: 3,
} as const;

const LoginForm = () => {
  const t = useTranslations('Auth.form');
  const tS = useTranslations('Shared');
  const dispatch = useAppDispatch();
  const rollbar = useRollbar();

  const userId = useTypedSelector((state) => state.user.id);
  const userLoading = useTypedSelector((state) => state.user.loading);
  const userAuthLoading = useTypedSelector((state) => state.user.authStateLoading);
  const userLoadError = useTypedSelector((state) => state.user.loadError);

  const [formError, setFormError] = useState<
    string | React.ReactNode | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');

  const [createEventLog] = useCreateEventLogMutation();

  useEffect(() => {
    if (userId) {
      logEvent(GET_LOGIN_USER_SUCCESS);
    }
  }, [userId]);

  useEffect(() => {
    if (userLoadError) {
      logEvent(GET_LOGIN_USER_ERROR, { message: userLoadError });

      setFormError(
        t.rich('getUserError', {
          contactLink: (children) => (
            <Link target="_blank" href={FEEDBACK_FORM_URL}>
              {children}
            </Link>
          ),
        }),
      );
    }
  }, [userLoadError, t, tS]);

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await dispatch(setAuthStateLoading(true));
    await setFormError('');
    logEvent(LOGIN_REQUEST);

    const { user, error } = await login(emailInput, passwordInput);
    if (error) {
      const errorCode = error.code;

      if (errorCode === 'auth/invalid-email') {
        setFormError(t('firebase.invalidEmail'));
      }
      if (errorCode === 'auth/too-many-requests') {
        setFormError(t('firebase.tooManyAttempts'));
      }
      if (errorCode === 'auth/user-not-found' || 'auth/wrong-password') {
        setFormError(t('firebase.authError'));
      }

      if (
        errorCode !== 'auth/too-many-requests' &&
        errorCode !== 'auth/invalid-email' &&
        errorCode !== 'auth/user-not-found' &&
        errorCode !== 'auth/wrong-password'
      ) {
        logEvent(LOGIN_ERROR, { message: errorCode });
        rollbar.error('User login firebase error', error);
      }
    } else if (user) {
      createEventLog({ event: EVENT_LOG_NAME.LOGGED_IN });
      logEvent(LOGIN_SUCCESS);
      logEvent(GET_LOGIN_USER_REQUEST);
    }

    await dispatch(setAuthStateLoading(false)); // important - triggers getUser in useLoadUser
  };

  return (
    <Box sx={containerStyle}>
      <form id="login-form" autoComplete="off" onSubmit={submitHandler}>
        <TextField
          id="email"
          onChange={(e) => setEmailInput(e.target.value)}
          label={t('emailLabel')}
          variant="standard"
          type="email"
          fullWidth
          required
        />
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
          <Typography color="error.main" mb={'1rem !important'}>
            {formError}
          </Typography>
        )}

        <LoadingButton
          id="login-submit"
          sx={{ mt: 2, mr: 1.5 }}
          variant="contained"
          fullWidth
          color="secondary"
          type="submit"
          loading={userAuthLoading || userLoading}
        >
          {t('loginSubmit')}
        </LoadingButton>
      </form>
    </Box>
  );
};

export default LoginForm;
