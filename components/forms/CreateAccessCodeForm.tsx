'use client';

import { Link as i18nLink } from '@/i18n/routing';
import { useAddPartnerAccessMutation } from '@/lib/api';
import { BASE_URL } from '@/lib/constants/common';
import {
  CREATE_PARTNER_ACCESS_ERROR,
  CREATE_PARTNER_ACCESS_REQUEST,
  CREATE_PARTNER_ACCESS_SUCCESS,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { getErrorMessage } from '@/lib/utils/errorMessage';
import logEvent from '@/lib/utils/logEvent';
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

type AccessTier = 'therapy' | 'liveChat';

const CreateAccessCodeForm = () => {
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const rollbar = useRollbar();

  const t = useTranslations('PartnerAdmin.createAccessCode');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTier, setSelectedTier] = useState<AccessTier | null>(null);
  const [formSubmitSuccess, setFormSubmitSuccess] = useState<boolean>(false);
  const [partnerAccessCode, setPartnerAccessCode] = useState<string | null>(null);
  const [formError, setFormError] = useState<
    string | React.ReactNode[] | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();
  const [addPartnerAccess] = useAddPartnerAccessMutation();

  const therapySessionsPerCode = partnerAdmin.partner?.therapySessionsPerCode ?? 0;
  // A partner with no therapy still needs codes for courses and messaging
  const tier: AccessTier = therapySessionsPerCode > 0 ? 'therapy' : 'liveChat';
  const tierLabel =
    tier === 'therapy'
      ? t('form.featureTherapySessionsLabel', { count: therapySessionsPerCode })
      : t('form.featureLiveChatLabel');

  const welcomeURL = `${BASE_URL}/welcome/${partnerAdmin.partner?.slug}`;

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!selectedTier) {
      setFormError(t('form.errors.featureRequired'));
      setLoading(false);
      return;
    }

    const includeTherapy = selectedTier === 'therapy';
    const therapySessionsRemaining = includeTherapy ? therapySessionsPerCode : 0;

    const eventData = {
      feature_courses: true,
      feature_live_chat: true,
      feature_therapy: includeTherapy,
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
        <Typography
          variant="h3"
          component="h3"
          sx={{
            mb: 1,
          }}
        >
          {selectedTier === 'therapy'
            ? t('therapySessionsAccess', { count: therapySessionsPerCode })
            : t('liveChatAccess')}
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
        <Typography
          sx={{
            mt: 2,
          }}
        >
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
          onChange={(e) => setSelectedTier(e.target.value as AccessTier)}
        >
          <FormControlLabel value={tier} control={<Radio />} label={tierLabel} />
        </RadioGroup>
      </FormControl>
      {formError && (
        <Typography
          sx={{
            color: 'error.main',
          }}
        >
          {formError}
        </Typography>
      )}
      <Button variant="contained" color="secondary" type="submit" loading={loading}>
        {t('title')}
      </Button>
    </form>
  );
};

export default CreateAccessCodeForm;
