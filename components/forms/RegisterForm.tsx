'use client';

import { Link as i18nLink, useRouter } from '@/i18n/routing';
import {
  useAddUserMutation,
  useGetAutomaticAccessCodeFeatureForPartnerQuery,
  useValidateCodeMutation,
} from '@/lib/api';
import { login } from '@/lib/auth';
import { ErrorDisplay, FEEDBACK_FORM_URL } from '@/lib/constants/common';
import { LANGUAGES, PARTNER_ACCESS_CODE_STATUS } from '@/lib/constants/enums';
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
  VALIDATE_ACCESS_CODE_ERROR,
  VALIDATE_ACCESS_CODE_INVALID,
  VALIDATE_ACCESS_CODE_REQUEST,
  VALIDATE_ACCESS_CODE_SUCCESS,
} from '@/lib/constants/events';
import { useAppDispatch, useTypedSelector } from '@/lib/hooks/store';
import { setUserLoading } from '@/lib/store/userSlice';
import { getErrorMessage } from '@/lib/utils/errorMessage';
import hasAutomaticAccessFeature from '@/lib/utils/hasAutomaticAccessCodeFeature';
import logEvent from '@/lib/utils/logEvent';
import theme from '@/styles/theme';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useLocale, useTranslations } from 'next-intl';
import * as React from 'react';
import { useEffect, useState } from 'react';

const containerStyle = {
  marginY: 3,
} as const;

const contactCheckboxStyle = {
  '+ .MuiFormControlLabel-label': {
    fontSize: theme.typography.body2.fontSize,
  },
} as const;

interface RegisterFormProps {
  codeParam?: string;
  partnerName?: string;
  partnerId?: string;
  accessCodeRequired?: boolean;
}

const RegisterForm = (props: RegisterFormProps) => {
  const { codeParam, partnerName, partnerId, accessCodeRequired } = props;
  const locale = useLocale();
  const userId = useTypedSelector((state) => state.user.id);
  const userLoading = useTypedSelector((state) => state.user.loading);
  const rollbar = useRollbar();

  const [loading, setLoading] = useState<boolean>(false);
  const [codeInput, setCodeInput] = useState<string>(codeParam ?? '');
  const [nameInput, setNameInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [contactPermissionInput, setContactPermissionInput] = useState<boolean>(false);
  const [formError, setFormError] = useState<ErrorDisplay>();

  const [createUser] = useAddUserMutation();
  const [validateCode] = useValidateCodeMutation();
  const dispatch: any = useAppDispatch();
  const t = useTranslations('Auth.form');
  const router = useRouter();

  // Include access code field if the partner requires access codes, or the user
  // has provided an access code for additional features on signup (i.e. not required, but additional access)
  const includeCodeField = partnerName && (accessCodeRequired || codeParam);

  useEffect(() => {
    // Redirects in 2 scenarios:
    // if user registration is successful and user loading is complete in useLoadUser
    // if user lands on register page but is already signed in
    if (userId) {
      router.push('/account/about-you');
    }
  }, [userId, router]);

  const validateAccessCode = async () => {
    logEvent(VALIDATE_ACCESS_CODE_REQUEST, { partner: partnerName });

    const validateCodeResponse = await validateCode({
      partnerAccessCode: codeInput,
    });

    if (validateCodeResponse.error) {
      const error = getErrorMessage(validateCodeResponse.error);

      if (error === PARTNER_ACCESS_CODE_STATUS.ALREADY_IN_USE) {
        setFormError(t('codeErrors.alreadyInUse', { partnerName: partnerName }));
      } else if (error === PARTNER_ACCESS_CODE_STATUS.CODE_EXPIRED) {
        setFormError(t('codeErrors.expired', { partnerName: partnerName }));
      } else if (
        error === PARTNER_ACCESS_CODE_STATUS.DOES_NOT_EXIST ||
        PARTNER_ACCESS_CODE_STATUS.INVALID_CODE
      ) {
        setFormError(t('codeErrors.invalid', { partnerName: partnerName }));
      } else {
        setFormError(
          t.rich('codeErrors.internal', {
            contactLink: (children) => (
              <Link target="_blank" href={FEEDBACK_FORM_URL}>
                {children}
              </Link>
            ),
          }),
        );
        rollbar.error('Validate code error', validateCodeResponse.error);
        logEvent(VALIDATE_ACCESS_CODE_ERROR, { partner: partnerName, message: error });
        return;
      }
      logEvent(VALIDATE_ACCESS_CODE_INVALID, { partner: partnerName, message: error });
    } else {
      logEvent(VALIDATE_ACCESS_CODE_SUCCESS, { partner: partnerName });
    }
  };

  const createUserRecord = async () => {
    await dispatch(setUserLoading(true));
    const userResponse = await createUser({
      partnerAccessCode: codeInput,
      name: nameInput,
      email: emailInput,
      password: passwordInput,
      contactPermission: contactPermissionInput,
      signUpLanguage: locale as LANGUAGES,
      partnerId: partnerId,
    });

    if (userResponse?.data && userResponse.data.user.id) {
      logEvent(REGISTER_SUCCESS);
      try {
        const { user, error } = await login(emailInput, passwordInput);

        if (user && !error) {
          logEvent(LOGIN_SUCCESS);
          logEvent(GET_USER_REQUEST); // deprecated event
          logEvent(GET_LOGIN_USER_REQUEST);
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
        logEvent(REGISTER_ERROR, { partner: partnerName, message: errorMessage });

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
    }
  };

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setFormError('');
    logEvent(REGISTER_REQUEST);

    includeCodeField && (await validateAccessCode());
    await createUserRecord();
    setLoading(false);
  };

  return (
    <Box sx={containerStyle}>
      <form autoComplete="off" onSubmit={submitHandler}>
        {includeCodeField && (
          <TextField
            id="partnerAccessCode"
            onChange={(e) => setCodeInput(e.target.value)}
            value={codeInput}
            label={`${partnerName} ${t('codeLabel')}`}
            variant="standard"
            fullWidth
            required={!!partnerName}
          />
        )}
        <TextField
          id="name"
          onChange={(e) => setNameInput(e.target.value)}
          label={t('nameLabel')}
          variant="standard"
          fullWidth
          required
        />
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
        <FormControl>
          <FormControlLabel
            label={t('contactPermissionLabel')}
            control={
              <Checkbox
                sx={contactCheckboxStyle}
                aria-label={t('contactPermissionLabel')}
                onChange={(e) => setContactPermissionInput(e.target.value === 'true')}
              />
            }
          />
        </FormControl>

        <LoadingButton
          sx={{ mt: 2, mr: 1.5 }}
          variant="contained"
          fullWidth
          color="secondary"
          type="submit"
          loading={loading || userLoading}
        >
          {t('registerSubmit')}
        </LoadingButton>
      </form>
    </Box>
  );
};

interface PartnerRegisterFormProps {
  codeParam: string;
  partnerName: string;
}

export const PartnerRegisterForm = ({ partnerName, codeParam }: PartnerRegisterFormProps) => {
  const partners = useTypedSelector((state) => state.partners);
  const [accessCodeRequired, setAccessCodeRequired] = useState<boolean>(false);
  const [partnerId, setPartnerId] = useState<string | undefined>(undefined);

  useGetAutomaticAccessCodeFeatureForPartnerQuery(partnerName);

  useEffect(() => {
    const partnerData = partners.find((p) => p.name.toLowerCase() === partnerName.toLowerCase());
    if (partnerData) setPartnerId(partnerData.id);
    if (partnerData && hasAutomaticAccessFeature(partnerData) === false) {
      setAccessCodeRequired(true);
    }
  }, [partners, partnerName]);

  return (
    <RegisterForm
      partnerName={partnerName}
      partnerId={!accessCodeRequired ? partnerId : undefined}
      codeParam={codeParam}
      accessCodeRequired={accessCodeRequired}
    />
  );
};

export default RegisterForm;
