'use client';

import SanitizedTextField from '@/components/common/SanitizedTextField';
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
import { Box, Checkbox, FormControl, FormControlLabel, Link } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import BaseRegisterForm, { useRegisterFormLogic } from './BaseRegisterForm';

const contactPermissionLabelStyle = {
  mr: 0,
  mt: 1,
  span: { fontSize: { xs: '0.875rem', md: '1rem !important' } },
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

      if (!error) return true;
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
        return false;
      }
      logEvent(VALIDATE_ACCESS_CODE_INVALID, { partner: partnerName, message: error });
    } else {
      logEvent(VALIDATE_ACCESS_CODE_SUCCESS, { partner: partnerName });
      return true;
    }
    return false;
  };

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (includeCodeField) {
      const validCode = await validateAccessCode();
      if (!validCode) {
        return;
      }
    }

    await handleSubmit(event, {
      partnerAccessCode: codeInput,
      name: nameInput,
      email: emailInput,
      password: passwordInput,
      contactPermission: contactPermissionInput,
      partnerId: partnerId,
    });
  };

  return (
    <BaseRegisterForm onSubmit={submitHandler} formError={formError} loading={loading}>
      <Box>
        {includeCodeField && (
          <SanitizedTextField
            id="partnerAccessCode"
            onChange={setCodeInput}
            value={codeInput}
            label={`${partnerName} ${t('codeLabel')}`}
            variant="standard"
            fullWidth
            required={!!partnerName}
          />
        )}
        <SanitizedTextField
          id="name"
          onChange={setNameInput}
          label={t('nameLabel')}
          variant="standard"
          fullWidth
          required
        />
        <SanitizedTextField
          id="email"
          onChange={setEmailInput}
          label={t('emailLabel')}
          variant="standard"
          type="email"
          fullWidth
          required
        />
        <SanitizedTextField
          id="password"
          onChange={setPasswordInput}
          label={t('passwordLabel')}
          type="password"
          variant="standard"
          fullWidth
          required
        />
        <FormControl>
          <FormControlLabel
            label={t('contactPermissionLabel')}
            sx={contactPermissionLabelStyle}
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
          sx={{ mt: 1, mr: 1.5 }}
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
