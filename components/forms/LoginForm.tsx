import LoadingButton from '@mui/lab/LoadingButton';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useState } from 'react';
import { useGetUserMutation } from '../../app/api';
import { setUserLoading, setUserToken } from '../../app/userSlice';
import { auth } from '../../config/firebase';
import rollbar from '../../config/rollbar';
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
import logEvent, { getEventUserData } from '../../utils/logEvent';
import Link from '../common/Link';

const containerStyle = {
  marginY: 3,
} as const;

const LoginForm = () => {
  const t = useTranslations('Auth.form');
  const tS = useTranslations('Shared');
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [getUser, { isLoading: getUserIsLoading }] = useGetUserMutation();
  const dispatch: any = useAppDispatch();

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setFormError('');
    logEvent(LOGIN_REQUEST);

    auth
      .signInWithEmailAndPassword(emailInput, passwordInput)
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
          logEvent(GET_USER_SUCCESS, { ...getEventUserData(userResponse.data) }); // deprecated event
          logEvent(GET_LOGIN_USER_SUCCESS, { ...getEventUserData(userResponse.data) });

          // Checking if the query type is a string to keep typescript happy
          // because a query value can be an array
          const returnUrl =
            typeof router.query.return_url === 'string' ? router.query.return_url : null;
          dispatch(setUserLoading(false));

          if (userResponse.data.partnerAdmin?.id) {
            router.push('/partner-admin/create-access-code');
          } else if (returnUrl) {
            router.push(returnUrl);
          } else {
            router.push('/courses');
          }
          setLoading(false);
        }
        if ('error' in userResponse) {
          const errorMessage = getErrorMessage(userResponse.error);
          logEvent(GET_USER_ERROR, { message: errorMessage }); // deprecated event
          logEvent(GET_LOGIN_USER_ERROR, { message: errorMessage });
          rollbar.error('User login get user error', userResponse.error);

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
        const errorMessage = error.message;

        logEvent(LOGIN_ERROR, { message: errorCode });
        rollbar.error('User login firebase error', error);

        if (errorCode === 'auth/invalid-email') {
          setFormError(t('firebase.invalidEmail'));
        }
        if (errorCode === 'auth/user-not-found' || 'auth/wrong-password') {
          setFormError(t('firebase.authError'));
        }
        setLoading(false);
        throw error;
      });
  };

  return (
    <Box sx={containerStyle}>
      <form autoComplete="off" onSubmit={submitHandler}>
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
          {t('loginSubmit')}
        </LoadingButton>
      </form>
    </Box>
  );
};

export default LoginForm;
