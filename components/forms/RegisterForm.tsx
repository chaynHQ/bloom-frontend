'use client';

import {
  useGetAutomaticAccessCodeFeatureForPartnerQuery,
  useValidateCodeMutation,
} from '@/lib/api';
import { FEEDBACK_FORM_URL } from '@/lib/constants/common';
import { PARTNER_ACCESS_CODE_STATUS } from '@/lib/constants/enums';
import {
  VALIDATE_ACCESS_CODE_ERROR,
  VALIDATE_ACCESS_CODE_INVALID,
  VALIDATE_ACCESS_CODE_REQUEST,
  VALIDATE_ACCESS_CODE_SUCCESS,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { getErrorMessage } from '@/lib/utils/errorMessage';
import hasAutomaticAccessFeature from '@/lib/utils/hasAutomaticAccessCodeFeature';
import logEvent from '@/lib/utils/logEvent';
import theme from '@/styles/theme';
import { LoadingButton } from '@mui/lab';
import { Box, Checkbox, FormControl, FormControlLabel, Link, TextField } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import BaseRegisterForm, { useRegisterFormLogic } from './BaseRegisterForm';

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
  const t = useTranslations('Auth.form');
  const rollbar = useRollbar();

  const [codeInput, setCodeInput] = useState<string>(codeParam ?? '');
  const [nameInput, setNameInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [contactPermissionInput, setContactPermissionInput] = useState<boolean>(false);

  const [validateCode] = useValidateCodeMutation();

  // Include access code field if the partner requires access codes, or the user
  // has provided an access code for additional features on signup (i.e. not required, but additional access)
  const includeCodeField = partnerName && (accessCodeRequired || codeParam);

  const { loading, userLoading, formError, setFormError, handleSubmit } = useRegisterFormLogic();

  const validateAccessCode = async () => {
    logEvent(VALIDATE_ACCESS_CODE_REQUEST, { partner: partnerName });

    const validateCodeResponse = await validateCode({
      partnerAccessCode: codeInput,
    });

    if (validateCodeResponse.error) {
      const error = getErrorMessage(validateCodeResponse.error);

      if (error === PARTNER_ACCESS_CODE_STATUS.ALREADY_IN_USE) {
        setFormError(t('codeErrors.alreadyInUse', { partnerName: partnerName as string }));
      } else if (error === PARTNER_ACCESS_CODE_STATUS.CODE_EXPIRED) {
        setFormError(t('codeErrors.expired', { partnerName: partnerName as string }));
      } else if (
        error === PARTNER_ACCESS_CODE_STATUS.DOES_NOT_EXIST ||
        PARTNER_ACCESS_CODE_STATUS.INVALID_CODE
      ) {
        setFormError(t('codeErrors.invalid', { partnerName: partnerName as string }));
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

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    await handleSubmit(event, {
      partnerAccessCode: codeInput,
      name: nameInput,
      email: emailInput,
      password: passwordInput,
      contactPermission: contactPermissionInput,
      partnerId: partnerId,
    });

    includeCodeField && (await validateAccessCode());
  };

  return (
    <BaseRegisterForm onSubmit={submitHandler} formError={formError} loading={loading}>
      <Box>
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
      </Box>
    </BaseRegisterForm>
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
