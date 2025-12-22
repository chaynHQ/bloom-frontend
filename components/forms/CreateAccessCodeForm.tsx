'use client';

import { Link as i18nLink } from '@/i18n/routing';
import { useAddPartnerAccessMutation } from '@/lib/api';
import { BASE_URL } from '@/lib/constants/common';
import { PARTNER_ACCESS_FEATURES } from '@/lib/constants/enums';
import {
  CREATE_PARTNER_ACCESS_ERROR,
  CREATE_PARTNER_ACCESS_REQUEST,
  CREATE_PARTNER_ACCESS_SUCCESS,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { getErrorMessage } from '@/lib/utils/errorMessage';
import logEvent from '@/lib/utils/logEvent';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Link,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useState } from 'react';

const CreateAccessCodeForm = () => {
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const rollbar = useRollbar();

  const t = useTranslations('PartnerAdmin.createAccessCode');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTier, setSelectedTier] = useState<PARTNER_ACCESS_FEATURES | null>(null);
  const [formSubmitSuccess, setFormSubmitSuccess] = useState<boolean>(false);
  const [partnerAccessCode, setPartnerAccessCode] = useState<string | null>(null);
  const [formError, setFormError] = useState<
    string | React.ReactNode[] | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();
  const [addPartnerAccess] = useAddPartnerAccessMutation();

  const welcomeURL = `${BASE_URL}/welcome/${partnerAdmin.partner?.name.toLocaleLowerCase()}`;

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!selectedTier) {
      setFormError(t('form.errors.featureRequired'));
      setLoading(false);
      return;
    }

    const includeTherapy = selectedTier === PARTNER_ACCESS_FEATURES.THERAPY;
    const therapySessionsRemaining: number =
      selectedTier === PARTNER_ACCESS_FEATURES.THERAPY ? 6 : 0;

    const eventData = {
      feature_courses: true,
      feature_live_chat: true,
      feature_therapy: includeTherapy,
      therapy_sessions_remaining: therapySessionsRemaining,
    };

    logEvent(CREATE_PARTNER_ACCESS_REQUEST, eventData);

    const partnerAccessResponse = await addPartnerAccess({
      featureLiveChat: true,
      featureTherapy: includeTherapy,
      therapySessionsRemaining: therapySessionsRemaining,
      therapySessionsRedeemed: 0,
    });

    if (partnerAccessResponse.data) {
      logEvent(CREATE_PARTNER_ACCESS_SUCCESS, eventData);
      setPartnerAccessCode(partnerAccessResponse.data.accessCode);
    }

    if (partnerAccessResponse.error) {
      const error = partnerAccessResponse.error;
      const errorMessage = getErrorMessage(error);

      logEvent(CREATE_PARTNER_ACCESS_ERROR, {
        ...eventData,
        error: errorMessage,
      });

      rollbar.error('Create partner access code error', error);

      setFormError(t('form.errors.createPartnerAccessError'));
      setLoading(false);
      throw error;
    }

    setLoading(false);
    setFormSubmitSuccess(true);
  };

  const resetForm = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setFormSubmitSuccess(false);
    setSelectedTier(null);
  };

  if (formSubmitSuccess) {
    return (
      <Box>
        <Typography variant="h3" component="h3" mb={1}>
          {t('therapyAccess')}
        </Typography>
        <Typography>
          {t.rich('resultLink', {
            welcomeURL: () => (
              <Link component={i18nLink} id="access-code-url" href={welcomeURL}>
                {welcomeURL}
              </Link>
            ),
          })}
        </Typography>
        <Typography mt={2}>
          {t.rich('resultCode', {
            partnerAccessCode: () => <strong id="access-code">{partnerAccessCode}</strong>,
          })}
        </Typography>

        <Box>
          <Button sx={{ mt: 3 }} variant="contained" color="secondary" onClick={resetForm}>
            {t('form.reset')}
          </Button>
        </Box>
      </Box>
    );
  }
  return (
    <form autoComplete="off" onSubmit={submitHandler}>
      <FormControl fullWidth component="fieldset">
        <FormLabel component="legend">{t('form.featuresLabel')}</FormLabel>
        <RadioGroup
          aria-label="feature"
          name="controlled-radio-buttons-group"
          value={selectedTier}
          onChange={(e) => setSelectedTier(e.target.value as PARTNER_ACCESS_FEATURES)}
        >
          <FormControlLabel
            value={PARTNER_ACCESS_FEATURES.THERAPY}
            control={<Radio />}
            label={t('form.featureTherapyLabel')}
          />
        </RadioGroup>
      </FormControl>

      {formError && <Typography color="error.main">{formError}</Typography>}

      <LoadingButton variant="contained" color="secondary" type="submit" loading={loading}>
        {t('title')}
      </LoadingButton>
    </form>
  );
};

export default CreateAccessCodeForm;
