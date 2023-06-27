import LoadingButton from '@mui/lab/LoadingButton';
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useState } from 'react';
import { useAddPartnerAccessMutation } from '../../app/api';
import { RootState } from '../../app/store';
import rollbar from '../../config/rollbar';
import { PARTNER_ACCESS_FEATURES } from '../../constants/enums';
import {
  CREATE_PARTNER_ACCESS_ERROR,
  CREATE_PARTNER_ACCESS_REQUEST,
  CREATE_PARTNER_ACCESS_SUCCESS,
} from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import { getErrorMessage } from '../../utils/errorMessage';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import Link from '../common/Link';

const CreateAccessCodeForm = () => {
  const { partnerAdmin, user, partnerAccesses } = useTypedSelector((state: RootState) => state);
  const eventUserData = getEventUserData({ user, partnerAccesses, partnerAdmin });

  const t = useTranslations('PartnerAdmin.createAccessCode');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTier, setSelectedTier] = useState<PARTNER_ACCESS_FEATURES | null>(null);
  const [formSubmitSuccess, setFormSubmitSuccess] = useState<boolean>(false);
  const [partnerAccessCode, setPartnerAccessCode] = useState<string | null>(null);
  const [formError, setFormError] = useState<
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();
  const [addPartnerAccess, { isLoading: addPartnerAccessIsLoading }] =
    useAddPartnerAccessMutation();

  const welcomeURL = `${
    process.env.NEXT_PUBLIC_BASE_URL
  }/welcome/${partnerAdmin.partner?.name.toLocaleLowerCase()}`;

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
      ...eventUserData,
    };

    logEvent(CREATE_PARTNER_ACCESS_REQUEST, eventData);

    const partnerAccessResponse = await addPartnerAccess({
      featureLiveChat: true,
      featureTherapy: includeTherapy,
      therapySessionsRemaining: therapySessionsRemaining,
      therapySessionsRedeemed: 0,
    });

    if ('data' in partnerAccessResponse) {
      logEvent(CREATE_PARTNER_ACCESS_SUCCESS, eventData);
      setPartnerAccessCode(partnerAccessResponse.data.accessCode);
    }

    if ('error' in partnerAccessResponse) {
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

  const FormResetButton = () => (
    <Box>
      <Button sx={{ mt: 3 }} variant="contained" color="secondary" onClick={resetForm}>
        {t('form.reset')}
      </Button>
    </Box>
  );

  const FormSuccess = () => (
    <Box>
      <Typography variant="h3" component="h3" mb={1}>
        {t('therapyAccess')}
      </Typography>
      <Typography>
        {t.rich('resultLink', {
          welcomeURL: (children) => (
            <Link id="access-code-url" href={welcomeURL}>
              {welcomeURL}
            </Link>
          ),
        })}
      </Typography>
      <Typography mt={2}>
        {t.rich('resultCode', {
          partnerAccessCode: (children) => <strong id="access-code">{partnerAccessCode}</strong>,
        })}
      </Typography>

      <FormResetButton />
    </Box>
  );

  const Form = () => (
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

  if (formSubmitSuccess) {
    return <FormSuccess />;
  }
  return <Form />;
};

export default CreateAccessCodeForm;
