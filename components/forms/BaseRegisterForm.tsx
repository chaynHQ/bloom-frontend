'use client';

import { Link as i18nLink, useRouter } from '@/i18n/routing';
import { useAddUserMutation } from '@/lib/api';
import { login } from '@/lib/auth';
import { ErrorDisplay, FEEDBACK_FORM_URL } from '@/lib/constants/common';
import { LANGUAGES } from '@/lib/constants/enums';
import {
  CREATE_USER_ALREADY_EXISTS,
  CREATE_USER_INVALID_EMAIL,
  CREATE_USER_WEAK_PASSWORD,
} from '@/lib/constants/errors';
import {
  GET_LOGIN_USER_REQUEST,
  GET_USER_REQUEST,
  LOGIN_SUCCESS,
  REGISTER_ERROR,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
} from '@/lib/constants/events';
import { useAppDispatch, useTypedSelector } from '@/lib/hooks/store';
import { setUserLoading } from '@/lib/store/userSlice';
import { getErrorMessage } from '@/lib/utils/errorMessage';
import logEvent from '@/lib/utils/logEvent';
import { Link, Typography } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useLocale, useTranslations } from 'next-intl';
import { ReactNode, useState } from 'react';

export interface BaseRegisterFormProps {
  children: ReactNode;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  formError?: ErrorDisplay;
  loading: boolean;
  redirectPath?: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  contactPermission: boolean;
  phoneNumber?: string;
  partnerAccessCode?: string;
  partnerId?: string;
}

export const defaultSignupRedirectPath = '/account/about-you';

export const useRegisterFormLogic = (redirectPath: string = defaultSignupRedirectPath) => {
  const locale = useLocale();
  const router = useRouter();
  const rollbar = useRollbar();
  const dispatch = useAppDispatch();
  const t = useTranslations('Auth.form');

  const userLoading = useTypedSelector((state) => state.user.loading);

  const [createUser] = useAddUserMutation();
  const [loading, setLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<ErrorDisplay>();

  const createUserRecord = async (formData: RegisterFormData) => {
    await dispatch(setUserLoading(true));

    const userResponse = await createUser({
      ...formData,
      signUpLanguage: locale as LANGUAGES,
    });

    if (userResponse?.data && userResponse.data.user.id) {
      logEvent(REGISTER_SUCCESS);
      try {
        const { user, error } = await login(formData.email, formData.password);

        if (user && !error) {
          logEvent(LOGIN_SUCCESS);
          logEvent(GET_USER_REQUEST); // deprecated event
          logEvent(GET_LOGIN_USER_REQUEST);

          // Redirect to the specified path
          router.push(redirectPath);
          return true;
        }
      } catch (err) {
        setFormError(
          t.rich('createUserError', {
            contactLink: (children) => (
              <Link target="_blank" href={FEEDBACK_FORM_URL}>
                {children}
              </Link>
            ),
          }),
        );
      }
    }

    if (userResponse.error) {
      const error = userResponse.error;
      const errorMessage = getErrorMessage(error);

      if (errorMessage === CREATE_USER_ALREADY_EXISTS) {
        setFormError(
          t.rich('firebase.emailAlreadyInUse', {
            loginLink: (children) => (
              <strong>
                <Link component={i18nLink} href="/auth/login">
                  {children}
                </Link>
              </strong>
            ),
          }),
        );
      } else if (errorMessage === CREATE_USER_WEAK_PASSWORD) {
        setFormError(t('firebase.weakPassword'));
      } else if (errorMessage === CREATE_USER_INVALID_EMAIL) {
        setFormError(t('firebase.invalidEmail'));
      } else {
        logEvent(REGISTER_ERROR, { message: String(errorMessage) });
        rollbar.error('User register create user error', error);
        setFormError(
          t.rich('createUserError', {
            contactLink: (children) => (
              <Link target="_blank" href={FEEDBACK_FORM_URL}>
                {children}
              </Link>
            ),
          }),
        );
      }
      await dispatch(setUserLoading(false));
      return false;
    }

    return false;
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
    formData: RegisterFormData,
  ) => {
    event.preventDefault();
    setLoading(true);
    setFormError('');
    logEvent(REGISTER_REQUEST);

    const isSuccess = await createUserRecord(formData);
    setLoading(false);
    return isSuccess;
  };

  return {
    loading,
    userLoading,
    formError,
    setFormError,
    handleSubmit,
  };
};

const BaseRegisterForm = ({ children, onSubmit, formError, loading }: BaseRegisterFormProps) => {
  return (
    <form autoComplete="off" onSubmit={onSubmit}>
      {children}

      {formError && (
        <Typography color="error.main" mb={2} pt={2}>
          {formError}
        </Typography>
      )}
    </form>
  );
};

export default BaseRegisterForm;
