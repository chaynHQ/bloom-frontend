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
import { useAddPartnerAccessMutation } from '../app/api';
import { PartnerAdmin } from '../app/partnerAdminSlice';
import Link from '../components/Link';
import rollbar from '../config/rollbar';
import { PARTNER_ACCESS_FEATURES } from '../constants/enums';
import {
  CREATE_PARTNER_ACCESS_ERROR,
  CREATE_PARTNER_ACCESS_REQUEST,
  CREATE_PARTNER_ACCESS_SUCCESS,
} from '../constants/events';
import { getErrorMessage } from '../utils/errorMessage';
import logEvent from '../utils/logEvent';

interface CreateAccessCodeFormProps {
  partnerAdmin: PartnerAdmin;
}

const CreateAccessCodeForm = (props: CreateAccessCodeFormProps) => {
  const { partnerAdmin } = props;

  const t = useTranslations('PartnerAdmin.createAccessCode');
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

  const welcomeURL = `${process.env.NEXT_PUBLIC_BASE_URL}/welcome?code=${partnerAccessCode}`;

  const submitHandler = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!selectedTier) {
      setFormError(t.rich('form.errors.featureRequired'));
      return;
    }

    const includeLiveChat =
      selectedTier === (PARTNER_ACCESS_FEATURES.LIVE_CHAT || PARTNER_ACCESS_FEATURES.THERAPY);
    const includeTherapy = selectedTier === PARTNER_ACCESS_FEATURES.THERAPY;
    const therapySessionsRemaining: number =
      selectedTier === PARTNER_ACCESS_FEATURES.THERAPY ? 6 : 0;

    const eventData = {
      partner: partnerAdmin.partner?.name,
      feature_courses: true,
      feature_live_chat: includeLiveChat,
      feature_therapy: includeTherapy,
      therapy_sessions_remaining: therapySessionsRemaining,
    };

    logEvent(CREATE_PARTNER_ACCESS_REQUEST, eventData);

    const partnerAccessResponse = await addPartnerAccess({
      featureLiveChat: includeLiveChat,
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
      rollbar.error('User register create user error', error);

      setFormError(t.rich('form.errors.createPartnerAccessError'));
      throw error;
    }

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
        {t.rich('form.reset')}
      </Button>
    </Box>
  );

  const FormSuccess = () => (
    <Box>
      <Typography variant="h4" component="h4" mb={1}>
        {selectedTier === 'courses' ? t('courseAccess') : t('therapyAccess')}
      </Typography>
      <Typography variant="body1" component="p">
        {t.rich('resultLink')}
      </Typography>
      <Link href={welcomeURL}>{welcomeURL}</Link>
      <Typography variant="body1" component="p">
        {t.rich('resultCode')} <strong>{partnerAccessCode}</strong>
      </Typography>
      <FormResetButton />
    </Box>
  );

  const Form = () => (
    <form autoComplete="off">
      <FormControl fullWidth component="fieldset">
        <FormLabel component="legend">{t.rich('form.featuresLabel')}</FormLabel>
        <RadioGroup
          aria-label="feature"
          name="controlled-radio-buttons-group"
          value={selectedTier}
          onChange={(e) => setSelectedTier(e.target.value as PARTNER_ACCESS_FEATURES)}
        >
          <FormControlLabel
            value={PARTNER_ACCESS_FEATURES.COURSES}
            control={<Radio />}
            label={t.rich('form.featureCoursesLabel')}
          />
          <FormControlLabel
            value={PARTNER_ACCESS_FEATURES.LIVE_CHAT}
            control={<Radio />}
            label={t.rich('form.featureLiveChatLabel')}
          />
          <FormControlLabel
            value={PARTNER_ACCESS_FEATURES.THERAPY}
            control={<Radio />}
            label={t.rich('form.featureTherapyLabel')}
          />
        </RadioGroup>
      </FormControl>

      {formError && (
        <Typography variant="body1" component="p" color="error.main" mt={2}>
          {formError}
        </Typography>
      )}
      <Button sx={{ mt: 3 }} variant="contained" color="secondary" onClick={submitHandler}>
        {t.rich('title')}
      </Button>
    </form>
  );

  if (formSubmitSuccess) {
    return <FormSuccess />;
  }
  return <Form />;
};

export default CreateAccessCodeForm;
