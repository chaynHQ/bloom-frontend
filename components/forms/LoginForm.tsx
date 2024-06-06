import LoadingButton from '@mui/lab/LoadingButton';
import { Box, TextField, Typography } from '@mui/material';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useState } from 'react';
import { useGetUserMutation } from '../../app/api';
import { setUserLoading, setUserToken } from '../../app/userSlice';
import {
  GET_LOGIN_USER_ERROR,
  GET_LOGIN_USER_REQUEST,
  GET_LOGIN_USER_SUCCESS,
  GET_USER_ERROR,
  GET_USER_REQUEST,
  GET_USER_SUCCESS,
  LOGIN_ERROR,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
} from '../../constants/events';
import { useAppDispatch } from '../../hooks/store';
import { getErrorMessage } from '../../utils/errorMessage';
import logEvent, { getEventUserResponseData } from '../../utils/logEvent';
import Link from '../common/Link';

const containerStyle = {
  marginY: 3,
} as const;

const LoginForm = () => {
  const t = useTranslations('Auth.form');
  const tS = useTranslations('Shared');

  const [loading, setLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<
    string | React.ReactNode | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [getUser] = useGetUserMutation();
  const dispatch: any = useAppDispatch();

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setFormError('');
    logEvent(LOGIN_REQUEST);

    const auth = getAuth();

    signInWithEmailAndPassword(auth, emailInput, passwordInput)
      .then(async (userCredential) => {
        logEvent(LOGIN_SUCCESS);
        logEvent(GET_USER_REQUEST); // deprecated event
        logEvent(GET_LOGIN_USER_REQUEST);
        dispatch(setUserLoading(true));

        const token = await userCredential.user?.getIdToken();

        if (token) {
          await dispatch(setUserToken(token));
        }

        const userResponse = await getUser('');

        if ('data' in userResponse) {
          const eventUserData = getEventUserResponseData(userResponse.data);
          logEvent(GET_USER_SUCCESS, eventUserData); // deprecated event
          logEvent(GET_LOGIN_USER_SUCCESS, eventUserData);

          dispatch(setUserLoading(false));
          setLoading(false);
        }
        if ('error' in userResponse) {
          const errorMessage = getErrorMessage(userResponse.error);
          logEvent(GET_USER_ERROR, { message: errorMessage }); // deprecated event
          logEvent(GET_LOGIN_USER_ERROR, { message: errorMessage });
          (window as any).Rollbar?.error('User login get user error', userResponse.error);

          setFormError(
            t.rich('getUserError', {
              contactLink: (children) => <Link href={tS('feedbackTypeform')}>{children}</Link>,
            }),
          );
          dispatch(setUserLoading(false));
          setLoading(false);
        }
      })
      .catch((error) => {
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
        setLoading(false);

        if (
          errorCode !== 'auth/too-many-requests' &&
          errorCode !== 'auth/invalid-email' &&
          errorCode !== 'auth/user-not-found' &&
          errorCode !== 'auth/wrong-password'
        ) {
          logEvent(LOGIN_ERROR, { message: errorCode });
          (window as any).Rollbar?.error('User login firebase error', error);
          throw error;
        }
      });
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
          sx={{ mt: 2, mr: 1.5 }}
          variant="contained"
          fullWidth
          color="secondary"
          type="submit"
          loading={loading}
        >
          {t('loginSubmit')}
        </LoadingButton>
      </form>
    </Box>
  );
};

export default LoginForm;
