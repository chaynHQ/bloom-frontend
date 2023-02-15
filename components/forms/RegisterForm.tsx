import LoadingButton from '@mui/lab/LoadingButton';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  useAddUserMutation,
  useGetAutomaticAccessCodeFeatureForPartnerQuery,
  useValidateCodeMutation,
} from '../../app/api';
import { RootState } from '../../app/store';
import { setUserLoading, setUserToken } from '../../app/userSlice';
import { auth } from '../../config/firebase';
import rollbar from '../../config/rollbar';
import { LANGUAGES, PARTNER_ACCESS_CODE_STATUS } from '../../constants/enums';
import {
  CREATE_USER_EMAIL_ALREADY_EXISTS,
  CREATE_USER_INVALID_EMAIL,
  CREATE_USER_WEAK_PASSWORD,
} from '../../constants/errors';
import {
  GET_LOGIN_USER_REQUEST,
  GET_USER_REQUEST,
  LOGIN_SUCCESS,
  REGISTER_ERROR,
  REGISTER_SUCCESS,
  VALIDATE_ACCESS_CODE_ERROR,
  VALIDATE_ACCESS_CODE_INVALID,
  VALIDATE_ACCESS_CODE_REQUEST,
  VALIDATE_ACCESS_CODE_SUCCESS,
} from '../../constants/events';
import { useAppDispatch, useTypedSelector } from '../../hooks/store';
import { getErrorMessage } from '../../utils/errorMessage';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import Link from '../common/Link';

const containerStyle = {
  marginY: 3,
} as const;

interface RegisterFormProps {
  codeParam?: string;
  partnerName?: string;
  partnerId?: string;
  accessCodeRequired?: boolean;
}

const RegisterForm = (props: RegisterFormProps) => {
  const { codeParam, partnerName, partnerId, accessCodeRequired } = props;

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
    if (codeParam) {
      setCodeInput(codeParam);
    }
  }, [codeParam]);

  const validateAccessCode = async () => {
    logEvent(VALIDATE_ACCESS_CODE_REQUEST, { partner: partnerName });

    const validateCodeResponse = await validateCode({
      partnerAccessCode: codeInput,
    });

    if ('error' in validateCodeResponse) {
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
            contactLink: (children) => <Link href={tS('feedbackTypeform')}>{children}</Link>,
          }),
        );
        rollbar.error('Validate code error', validateCodeResponse.error);
        logEvent(VALIDATE_ACCESS_CODE_ERROR, { partner: partnerName, message: error });
        setLoading(false);
        throw error;
      }
      logEvent(VALIDATE_ACCESS_CODE_INVALID, { partner: partnerName, message: error });
      setLoading(false);
      throw error;
    }
    logEvent(VALIDATE_ACCESS_CODE_SUCCESS, { partner: partnerName });
  };

  const createUserRecord = async () => {
    const userResponse = await createUser({
      partnerAccessCode: codeInput,
      name: nameInput,
      email: emailInput,
      password: passwordInput,
      contactPermission: contactPermissionInput,
      signUpLanguage: router.locale as LANGUAGES,
      partnerId: partnerId,
    });

    if ('data' in userResponse && userResponse.data.user.id) {
      logEvent(REGISTER_SUCCESS, { ...getEventUserData(userResponse.data) });
      try {
        const userCredential = await auth.signInWithEmailAndPassword(emailInput, passwordInput);
        logEvent(LOGIN_SUCCESS);
        logEvent(GET_USER_REQUEST); // deprecated event
        logEvent(GET_LOGIN_USER_REQUEST);
        const token = await userCredential.user?.getIdToken();
        if (token) {
          await dispatch(setUserToken(token));
          setLoading(false);
          router.push('/courses');
        }
      } catch (err) {
        setFormError(
          t.rich('createUserError', {
            contactLink: (children) => <Link href={tS('feedbackTypeform')}>{children}</Link>,
          }),
        );
        setLoading(false);
      }
    }

    if ('error' in userResponse) {
      const error = userResponse.error;
      const errorMessage = getErrorMessage(error);
      logEvent(REGISTER_ERROR, { partner: partnerName, message: errorMessage });
      if (errorMessage === CREATE_USER_EMAIL_ALREADY_EXISTS) {
        setFormError(
          t.rich('firebase.emailAlreadyInUse', {
            loginLink: (children) => (
              <strong>
                <Link href="/auth/login">{children}</Link>
              </strong>
            ),
          }),
        );
      } else if (errorMessage === CREATE_USER_WEAK_PASSWORD) {
        setFormError(t('firebase.weakPassword'));
      } else if (errorMessage === CREATE_USER_INVALID_EMAIL) {
        setFormError(t('firebase.invalidEmail'));
      } else {
        setFormError(
          t.rich('createUserError', {
            contactLink: (children) => <Link href={tS('feedbackTypeform')}>{children}</Link>,
          }),
        );
      }
      logEvent(REGISTER_ERROR, { partner: partnerName, message: errorMessage });
      rollbar.error('User register create user error', error);

      setLoading(false);

      throw error;
    }
  };

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setFormError('');

    try {
      partnerName && accessCodeRequired && (await validateAccessCode());
      dispatch(setUserLoading(true));
      await createUserRecord();
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
        {partnerName && accessCodeRequired && (
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

interface PartnerRegisterFormProps {
  codeParam: string;
  partnerName: string;
}

export const PartnerRegisterForm = ({ partnerName, codeParam }: PartnerRegisterFormProps) => {
  const { partners } = useTypedSelector((state: RootState) => state);
  const [accessCodeRequired, setAccessCodeRequired] = useState<boolean>(true);
  const [partnerId, setPartnerId] = useState<string | undefined>(undefined);

  useGetAutomaticAccessCodeFeatureForPartnerQuery(partnerName);

  useEffect(() => {
    const partnerData = partners.find((p) => p.name.toLowerCase() === partnerName.toLowerCase());
    if (partnerData) {
      const hasAutomaticAccessFeature = partnerData.partnerFeature.reduce(
        (hasFeature, pf) =>
          hasFeature || (pf.feature.name === 'AUTOMATIC_ACCESS_CODE' && pf.active),
        false,
      );
      setAccessCodeRequired(!hasAutomaticAccessFeature);
      setPartnerId(partnerData.id);
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
