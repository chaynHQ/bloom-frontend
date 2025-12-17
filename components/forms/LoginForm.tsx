'use client';

import SanitizedTextField from '@/components/common/SanitizedTextField';
import { useRouter } from '@/i18n/routing';
import { useCreateEventLogMutation } from '@/lib/api';
import { login } from '@/lib/auth';
import { FEEDBACK_FORM_URL } from '@/lib/constants/common';
import { EVENT_LOG_NAME } from '@/lib/constants/enums';
import {
  CREATE_ACCOUNT_LINK_CLICKED,
  GET_AUTH_USER_ERROR,
  GET_LOGIN_USER_ERROR,
  GET_LOGIN_USER_REQUEST,
  GET_LOGIN_USER_SUCCESS,
  LOGIN_ERROR,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  RESET_PASSWORD_HERE_CLICKED,
} from '@/lib/constants/events';
import { auth } from '@/lib/firebase';
import { useAppDispatch, useTypedSelector } from '@/lib/hooks/store';
import { setAuthStateLoading } from '@/lib/store/userSlice';
import logEvent from '@/lib/utils/logEvent';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Link, Typography } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { getMultiFactorResolver, MultiFactorError, MultiFactorResolver } from 'firebase/auth';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import SetupMFA from '../guards/SetupMFA';
import VerifyMFA from '../guards/VerifyMFA';

const LoginForm = () => {
  const t = useTranslations('Auth');
  const dispatch = useAppDispatch();
  const rollbar = useRollbar();
  const router = useRouter();
  const searchParams = useSearchParams();

  const userId = useTypedSelector((state) => state.user.id);
  const userLoading = useTypedSelector((state) => state.user.loading);
  const userAuthLoading = useTypedSelector((state) => state.user.authStateLoading);
  const userLoadError = useTypedSelector((state) => state.user.loadError);
  const userIsSuperAdmin = useTypedSelector((state) => state.user.isSuperAdmin);
  const userMFAisSetup = useTypedSelector((state) => state.user.MFAisSetup);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

  const [formError, setFormError] = useState<
    string | React.ReactNode | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showVerifyMFA, setShowVerifyMFA] = useState<boolean>(false);
  const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver>();

  const [createEventLog] = useCreateEventLogMutation();

  // Derive showSetupMFA from user state instead of using useState + useEffect
  const showSetupMFA = useMemo(() => {
    if (!userId) return false;
    if (userIsSuperAdmin && userMFAisSetup) return false;
    return userIsSuperAdmin && !userMFAisSetup;
  }, [userId, userIsSuperAdmin, userMFAisSetup]);

  // Track if we've already logged success and redirected to prevent duplicate side effects
  const hasHandledLoginRef = useRef(false);

  useEffect(() => {
    // Reset ref when user logs out
    if (!userId) {
      hasHandledLoginRef.current = false;
      return;
    }

    // Don't redirect if showing MFA setup
    if (showSetupMFA) return;

    // Prevent duplicate handling
    if (hasHandledLoginRef.current) return;
    hasHandledLoginRef.current = true;

    logEvent(GET_LOGIN_USER_SUCCESS);

    // Redirect if the user login process is complete and userId loaded
    const returnUrl = searchParams?.get('return_url');

    if (partnerAdmin?.active) {
      router.push('/partner-admin/create-access-code');
    } else if (returnUrl) {
      router.push(returnUrl);
    } else {
      router.push('/courses');
    }
  }, [userId, showSetupMFA, router, searchParams, partnerAdmin]);

  // Derive error message from userLoadError
  const userLoadErrorMessage = useMemo(() => {
    if (!userLoadError) return null;
    return t.rich('form.getUserError', {
      contactLink: (children) => (
        <Link target="_blank" href={FEEDBACK_FORM_URL}>
          {children}
        </Link>
      ),
    });
  }, [userLoadError, t]);

  // Track previous error to log only on change
  const prevUserLoadErrorRef = useRef(userLoadError);
  useEffect(() => {
    if (userLoadError && userLoadError !== prevUserLoadErrorRef.current) {
      logEvent(GET_LOGIN_USER_ERROR, { message: userLoadError });
      logEvent(GET_AUTH_USER_ERROR, { message: userLoadError });
    }
    prevUserLoadErrorRef.current = userLoadError;
  }, [userLoadError]);

  // Combined error display (form submission errors + user load errors)
  const displayError = formError || userLoadErrorMessage;

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await dispatch(setAuthStateLoading(true));
    await setFormError('');
    logEvent(LOGIN_REQUEST);

    const { user, error } = await login(emailInput, passwordInput);
    if (error) {
      const errorCode = error.code;

      if (errorCode === 'auth/multi-factor-auth-required') {
        const resolver = getMultiFactorResolver(auth, error as MultiFactorError);
        setShowVerifyMFA(true);
        setMfaResolver(resolver);
      } else if (errorCode === 'auth/invalid-email') {
        setFormError(t('form.firebase.invalidEmail'));
      } else if (errorCode === 'auth/too-many-requests') {
        setFormError(t('form.firebase.tooManyAttempts'));
      } else if (errorCode === 'auth/user-not-found' || 'auth/wrong-password') {
        setFormError(t('form.firebase.authError'));
      } else {
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
    <Box mb={1}>
      <form id="login-form" autoComplete="off" onSubmit={submitHandler}>
        {showVerifyMFA && mfaResolver ? (
          <VerifyMFA resolver={mfaResolver} />
        ) : showSetupMFA ? (
          <SetupMFA />
        ) : (
          <>
            <SanitizedTextField
              id="email"
              onChange={setEmailInput}
              label={t('form.emailLabel')}
              variant="standard"
              type="email"
              fullWidth
              required
            />
            <SanitizedTextField
              id="password"
              onChange={setPasswordInput}
              label={t('form.passwordLabel')}
              type="password"
              variant="standard"
              fullWidth
              required
            />
            {displayError && (
              <Typography color="error.main" mb={'1rem !important'}>
                {displayError}
              </Typography>
            )}

            <LoadingButton
              id="login-submit"
              sx={{ mt: 2, mr: 1.5, mb: 2, minWidth: 150 }}
              variant="contained"
              color="secondary"
              type="submit"
              loading={userAuthLoading || userLoading}
            >
              {t('form.loginSubmit')}
            </LoadingButton>
            <Typography variant="body2" textAlign="left" mb={1}>
              {t.rich('login.resetPasswordLink', {
                resetLink: (children) => (
                  <Link
                    onClick={() => {
                      logEvent(RESET_PASSWORD_HERE_CLICKED);
                    }}
                    href="/auth/reset-password"
                  >
                    {children}
                  </Link>
                ),
              })}
            </Typography>
            <Typography variant="body2" textAlign="left">
              {t.rich('login.createAnAccountLink', {
                createAnAccountLink: (children) => (
                  <Link
                    onClick={() => {
                      logEvent(CREATE_ACCOUNT_LINK_CLICKED);
                    }}
                    href="/auth/register"
                  >
                    {children}
                  </Link>
                ),
              })}
            </Typography>
          </>
        )}
      </form>
    </Box>
  );
};

export default LoginForm;
