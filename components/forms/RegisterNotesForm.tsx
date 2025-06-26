'use client';

import { Link as i18nLink, useRouter } from '@/i18n/routing';
import { useAddUserMutation, useSubscribeToWhatsappMutation } from '@/lib/api';
import { login } from '@/lib/auth';
import { ErrorDisplay, FEEDBACK_FORM_URL } from '@/lib/constants/common';
import { LANGUAGES, WHATSAPP_SUBSCRIPTION_STATUS } from '@/lib/constants/enums';
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
  WHATSAPP_SUBSCRIBE_ERROR,
  WHATSAPP_SUBSCRIBE_REQUEST,
  WHATSAPP_SUBSCRIBE_SUCCESS,
} from '@/lib/constants/events';
import { useAppDispatch, useTypedSelector } from '@/lib/hooks/store';
import { setUserLoading } from '@/lib/store/userSlice';
import { getErrorMessage } from '@/lib/utils/errorMessage';
import logEvent from '@/lib/utils/logEvent';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useLocale, useTranslations } from 'next-intl';
import { phone } from 'phone';
import { useState } from 'react';
import PhoneInput from './PhoneInput';

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
} as const;

const RegisterNotesForm = () => {
  const locale = useLocale();
  const userId = useTypedSelector((state) => state.user.id);
  const userLoading = useTypedSelector((state) => state.user.loading);
  const rollbar = useRollbar();

  const [loading, setLoading] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [contactPermissionInput, setContactPermissionInput] = useState<boolean>(false);
  const [formError, setFormError] = useState<ErrorDisplay>();

  const [createUser] = useAddUserMutation();
  const [subscribeToWhatsapp] = useSubscribeToWhatsappMutation();
  const dispatch: any = useAppDispatch();
  const t = useTranslations('Auth.form');
  const tWhatsapp = useTranslations('Whatsapp.form');
  const tNotes = useTranslations('Whatsapp.notes');
  const router = useRouter();

  const validatePhoneNumber = (phoneNumber: string): string | undefined => {
    const sanitisedNumber = phoneNumber.replace(/\s/g, '');
    const validationResult = phone(sanitisedNumber);

    if (validationResult.isValid) {
      return validationResult.phoneNumber;
    } else {
      return undefined;
    }
  };

  const createUserRecord = async () => {
    await dispatch(setUserLoading(true));
    const userResponse = await createUser({
      name: nameInput,
      email: emailInput,
      password: passwordInput,
      contactPermission: contactPermissionInput,
      signUpLanguage: locale as LANGUAGES,
    });

    if (userResponse?.data && userResponse.data.user.id) {
      logEvent(REGISTER_SUCCESS);
      try {
        const { user, error } = await login(emailInput, passwordInput);

        if (user && !error) {
          logEvent(LOGIN_SUCCESS);
          logEvent(GET_USER_REQUEST);
          logEvent(GET_LOGIN_USER_REQUEST);

          // Subscribe to WhatsApp after successful registration
          const validatedNumber = validatePhoneNumber(phoneNumber);
          if (validatedNumber) {
            logEvent(WHATSAPP_SUBSCRIBE_REQUEST);
            const subscribeResponse = await subscribeToWhatsapp({
              subscriptionInfo: validatedNumber,
            });

            if (subscribeResponse.data) {
              logEvent(WHATSAPP_SUBSCRIBE_SUCCESS);
              router.push('/courses');
            } else if (subscribeResponse.error) {
              const error = getErrorMessage(subscribeResponse.error);
              if (error === WHATSAPP_SUBSCRIPTION_STATUS.ALREADY_EXISTS) {
                setFormError(tWhatsapp('subscribeErrors.alreadyExists'));
              } else {
                setFormError(tWhatsapp('subscribeErrors.internal'));
              }
              logEvent(WHATSAPP_SUBSCRIBE_ERROR, { message: error });
            }
          } else {
            setFormError(tWhatsapp('subscribeErrors.invalidNumber'));
          }
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
        logEvent(REGISTER_ERROR, { message: errorMessage });
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

    // Validate phone number first
    const validatedNumber = validatePhoneNumber(phoneNumber);
    if (!validatedNumber) {
      setFormError(tWhatsapp('subscribeErrors.invalidNumber'));
      setLoading(false);
      return;
    }

    await createUserRecord();
    setLoading(false);
  };

  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
  };

  return (
    <Box component="form" autoComplete="off" onSubmit={submitHandler} sx={formStyle}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            id="name"
            onChange={(e) => setNameInput(e.target.value)}
            label={t('nameLabel')}
            variant="standard"
            fullWidth
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <PhoneInput value={phoneNumber} onChange={handlePhoneNumberChange} required />
        </Grid>
      </Grid>{' '}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            id="email"
            onChange={(e) => setEmailInput(e.target.value)}
            label={t('emailLabel')}
            variant="standard"
            type="email"
            fullWidth
            required
          />{' '}
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            id="password"
            onChange={(e) => setPasswordInput(e.target.value)}
            label={t('passwordLabel')}
            type="password"
            variant="standard"
            fullWidth
            required
          />
        </Grid>
      </Grid>
      {formError && (
        <Typography color="error.main" mb={2}>
          {formError}
        </Typography>
      )}
      <FormControl>
        <FormControlLabel
          label={t('contactPermissionLabel')}
          control={
            <Checkbox
              aria-label={t('contactPermissionLabel')}
              onChange={(e) => setContactPermissionInput(e.target.checked)}
            />
          }
        />
      </FormControl>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2">
          {tNotes('haveAccount')}{' '}
          <Link component={i18nLink} href="/auth/login">
            {tNotes('login')}
          </Link>
        </Typography>

        <LoadingButton
          variant="contained"
          color="secondary"
          type="submit"
          loading={loading || userLoading}
          sx={{ borderRadius: 100 }}
        >
          {tNotes('createAccountButton')}
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default RegisterNotesForm;
