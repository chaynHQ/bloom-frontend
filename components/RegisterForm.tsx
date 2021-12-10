import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useState } from 'react';
import { useAddUserMutation, useValidateCodeMutation } from '../app/api';
import Link from '../components/Link';
import { auth } from '../config/firebase';
import rollbar from '../config/rollbar';
import {
  REGISTER_ERROR,
  REGISTER_FIREBASE_ERROR,
  REGISTER_SUCCESS,
  VALIDATE_ACCESS_CODE_ERROR,
  VALIDATE_ACCESS_CODE_INVALID,
  VALIDATE_ACCESS_CODE_REQUEST,
  VALIDATE_ACCESS_CODE_SUCCESS,
} from '../constants/events';
import { LANGUAGES } from '../constants/languages';
import { PARTNER_ACCESS_CODE_STATUS } from '../constants/responses';
import { getErrorMessage } from '../utils/errorMessage';
import logEvent, { getEventUserData } from '../utils/logEvent';

const containerStyle = {
  marginY: 3,
} as const;

const RegisterForm = () => {
  const t = useTranslations('Auth.form');
  const router = useRouter();
  let codeParam = router.query.code;

  if (codeParam instanceof Array) {
    codeParam = codeParam + '';
  }

  const [formError, setFormError] = useState<
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();
  const [codeInput, setCodeInput] = useState<string>(codeParam ? codeParam : '');
  const [nameInput, setNameInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [contactPermissionInput, setContactPermissionInput] = useState<boolean>(false);

  const [createUser, { isLoading: createIsLoading }] = useAddUserMutation();
  const [validateCode, { isLoading: validateIsLoading }] = useValidateCodeMutation();

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    logEvent(VALIDATE_ACCESS_CODE_REQUEST, { partner: 'bumble' });

    setFormError('');
    const validateCodeResponse = await validateCode({
      partnerAccessCode: codeInput,
    });

    if ('error' in validateCodeResponse) {
      const error = getErrorMessage(validateCodeResponse.error);

      if (error === PARTNER_ACCESS_CODE_STATUS.ALREADY_IN_USE) {
        setFormError(t('codeErrors.alreadyInUse'));
      } else if (error === PARTNER_ACCESS_CODE_STATUS.CODE_EXPIRED) {
        setFormError(t('codeErrors.expired'));
      } else if (
        error === PARTNER_ACCESS_CODE_STATUS.DOES_NOT_EXIST ||
        PARTNER_ACCESS_CODE_STATUS.INVALID_CODE
      ) {
        setFormError(t('codeErrors.invalid'));
      } else {
        setFormError(
          t.rich('codeErrors.internal', {
            contactLink: (children) => (
              <Link href="https://chayn.typeform.com/to/OY9Wdk4h">{children}</Link>
            ),
          }),
        );
        rollbar.error('Validate code error', validateCodeResponse.error);
        logEvent(VALIDATE_ACCESS_CODE_ERROR, { partner: 'bumble', message: error });
        return;
      }
      logEvent(VALIDATE_ACCESS_CODE_INVALID, { partner: 'bumble', message: error });
      return;
    }
    logEvent(VALIDATE_ACCESS_CODE_SUCCESS, { partner: 'bumble' });

    const firebaseUser = await auth
      .createUserWithEmailAndPassword(emailInput, passwordInput)
      .then(async (userCredential) => {
        const user = userCredential.user;
        const token = await user?.getIdToken();
        if (token) {
          localStorage.setItem('accessToken', token);
        }
        return user;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        logEvent(REGISTER_FIREBASE_ERROR, { partner: 'bumble', message: errorMessage });

        if (errorCode === 'auth/invalid-email') {
          setFormError(t('firebase.invalidEmail'));
        }
        if (errorCode === 'auth/weak-password') {
          setFormError(t('firebase.weakPassword'));
        }
        if (errorCode === 'auth/email-already-in-use') {
          setFormError(
            t.rich('firebase.emailAlreadyInUse', {
              loginLink: (children) => (
                <strong>
                  <Link href="/login">{children}</Link>
                </strong>
              ),
            }),
          );
        }
      });

    if (!firebaseUser) {
      return;
    }

    const userResponse = await createUser({
      firebaseUid: firebaseUser?.uid,
      partnerAccessCode: codeInput,
      name: nameInput,
      email: emailInput,
      contactPermission: contactPermissionInput,
      languageDefault: LANGUAGES.en,
    });

    if ('error' in userResponse) {
      const errorMessage = getErrorMessage(userResponse.error);
      logEvent(REGISTER_ERROR, { partner: 'bumble', message: errorMessage });
      rollbar.error('User register create user error', userResponse.error);

      setFormError(
        t.rich('createUserError', {
          contactLink: (children) => (
            <Link href="https://chayn.typeform.com/to/OY9Wdk4h">{children}</Link>
          ),
        }),
      );
      return;
    }

    logEvent(REGISTER_SUCCESS, { ...getEventUserData(userResponse.data) });
    router.push('/therapy-booking');
  };

  return (
    <Box sx={containerStyle}>
      <form autoComplete="off" onSubmit={submitHandler}>
        <TextField
          id="partnerAccessCode"
          onChange={(e) => setCodeInput(e.target.value)}
          defaultValue={codeInput}
          label={t.rich('codeLabel')}
          variant="standard"
          fullWidth
          required
        />
        <TextField
          id="name"
          onChange={(e) => setNameInput(e.target.value)}
          label={t.rich('nameLabel')}
          variant="standard"
          fullWidth
          required
        />
        <TextField
          id="email"
          onChange={(e) => setEmailInput(e.target.value)}
          label={t.rich('emailLabel')}
          variant="standard"
          fullWidth
          required
        />
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
        <FormControl>
          <FormControlLabel
            label={t.rich('contactPermissionLabel')}
            control={
              <Checkbox
                aria-label={t.raw('contactPermissionLabel')}
                onChange={(e) => setContactPermissionInput(e.target.value === 'true')}
              />
            }
          />
        </FormControl>

        <Button
          sx={{ mt: 2, mr: 1.5 }}
          variant="contained"
          fullWidth
          disabled={createIsLoading || validateIsLoading}
          color="secondary"
          type="submit"
        >
          {t.rich('registerSubmit')}
        </Button>
      </form>
    </Box>
  );
};

export default RegisterForm;
