import LoadingButton from '@mui/lab/LoadingButton';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import firebase from 'firebase/compat/app';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useAddUserMutation, useValidateCodeMutation } from '../../app/api';
import { setUserLoading, setUserToken } from '../../app/userSlice';
import { auth } from '../../config/firebase';
import rollbar from '../../config/rollbar';
import { LANGUAGES, PARTNER_ACCESS_CODE_STATUS } from '../../constants/enums';
import {
  REGISTER_ERROR,
  REGISTER_FIREBASE_ERROR,
  REGISTER_SUCCESS,
  VALIDATE_ACCESS_CODE_ERROR,
  VALIDATE_ACCESS_CODE_INVALID,
  VALIDATE_ACCESS_CODE_REQUEST,
  VALIDATE_ACCESS_CODE_SUCCESS,
} from '../../constants/events';
import { Partner } from '../../constants/partners';
import { useAppDispatch } from '../../hooks/store';
import { getErrorMessage } from '../../utils/errorMessage';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import Link from '../common/Link';

const containerStyle = {
  marginY: 3,
} as const;

interface RegisterFormProps {
  codeParam: string;
  partnerContent: Partner | null;
}

const RegisterForm = (props: RegisterFormProps) => {
  const { codeParam, partnerContent } = props;

  const [loading, setLoading] = useState<boolean>(false);
  const [codeInput, setCodeInput] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [contactPermissionInput, setContactPermissionInput] = useState<boolean>(false);
  const [formError, setFormError] = useState<
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();

  const [createUser, { isLoading: createIsLoading }] = useAddUserMutation();
  const [validateCode, { isLoading: validateIsLoading }] = useValidateCodeMutation();
  const dispatch: any = useAppDispatch();
  const t = useTranslations('Auth.form');
  const tS = useTranslations('Shared');
  const router = useRouter();

  useEffect(() => {
    setCodeInput(codeParam);
  }, [codeParam]);

  const validateAccessCode = async () => {
    logEvent(VALIDATE_ACCESS_CODE_REQUEST, { partner: partnerContent?.name });

    const validateCodeResponse = await validateCode({
      partnerAccessCode: codeInput,
    });

    if ('error' in validateCodeResponse) {
      const error = getErrorMessage(validateCodeResponse.error);

      if (error === PARTNER_ACCESS_CODE_STATUS.ALREADY_IN_USE) {
        setFormError(t('codeErrors.alreadyInUse', { partnerName: partnerContent?.name }));
      } else if (error === PARTNER_ACCESS_CODE_STATUS.CODE_EXPIRED) {
        setFormError(t('codeErrors.expired', { partnerName: partnerContent?.name }));
      } else if (
        error === PARTNER_ACCESS_CODE_STATUS.DOES_NOT_EXIST ||
        PARTNER_ACCESS_CODE_STATUS.INVALID_CODE
      ) {
        setFormError(t('codeErrors.invalid', { partnerName: partnerContent?.name }));
      } else {
        setFormError(
          t.rich('codeErrors.internal', {
            contactLink: (children) => <Link href={tS('feedbackTypeform')}>{children}</Link>,
          }),
        );
        rollbar.error('Validate code error', validateCodeResponse.error);
        logEvent(VALIDATE_ACCESS_CODE_ERROR, { partner: partnerContent?.name, message: error });
        setLoading(false);
        throw error;
      }
      logEvent(VALIDATE_ACCESS_CODE_INVALID, { partner: partnerContent?.name, message: error });
      setLoading(false);
      throw error;
    }
    logEvent(VALIDATE_ACCESS_CODE_SUCCESS, { partner: partnerContent?.name });
  };

  const createFirebaseUser = async () => {
    const firebaseUser = await auth
      .createUserWithEmailAndPassword(emailInput, passwordInput)
      .then(async (userCredential) => {
        if (userCredential.user) {
          await dispatch(setUserToken(userCredential.user.refreshToken));
        }
        return userCredential.user;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        logEvent(REGISTER_FIREBASE_ERROR, { partner: partnerContent?.name, message: errorMessage });

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
                  <Link href="/auth/login">{children}</Link>
                </strong>
              ),
            }),
          );
        }
        setLoading(false);
        throw error;
      });
    return firebaseUser;
  };

  const createUserRecord = async (firebaseUser: firebase.User) => {
    const userResponse = await createUser({
      firebaseUid: firebaseUser?.uid,
      partnerAccessCode: codeInput,
      name: nameInput,
      email: emailInput,
      contactPermission: contactPermissionInput,
      signUpLanguage: router.locale as LANGUAGES,
    });

    if ('data' in userResponse && userResponse.data.user.id) {
      logEvent(REGISTER_SUCCESS, { ...getEventUserData(userResponse.data) });
    }

    if ('error' in userResponse) {
      const error = userResponse.error;
      const errorMessage = getErrorMessage(error);
      logEvent(REGISTER_ERROR, { partner: partnerContent?.name, message: errorMessage });
      rollbar.error('User register create user error', error);

      setFormError(
        t.rich('createUserError', {
          contactLink: (children) => <Link href={tS('feedbackTypeform')}>{children}</Link>,
        }),
      );
      setLoading(false);

      throw error;
    }
  };

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setFormError('');

    try {
      partnerContent && (await validateAccessCode());
      dispatch(setUserLoading(true));
      const firebaseUser = await createFirebaseUser();
      await createUserRecord(firebaseUser!);
      dispatch(setUserLoading(false));
      router.push('/account/about-you');
      setLoading(false);
    } catch {
      // errors handled in each function
    }
  };

  return (
    <Box sx={containerStyle}>
      <form autoComplete="off" onSubmit={submitHandler}>
        {partnerContent && (
          <TextField
            id="partnerAccessCode"
            onChange={(e) => setCodeInput(e.target.value)}
            value={codeInput}
            label={`${partnerContent.name} ${t('codeLabel')}`}
            variant="standard"
            fullWidth
            required={!!partnerContent}
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
          loading={loading}
        >
          {t('registerSubmit')}
        </LoadingButton>
      </form>
    </Box>
  );
};

export default RegisterForm;
