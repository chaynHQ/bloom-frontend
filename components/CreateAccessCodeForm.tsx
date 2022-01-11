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
import Link from '../components/Link';
import rollbar from '../config/rollbar';
import {
  CREATE_PARTNER_ACCESS_ERROR,
  CREATE_PARTNER_ACCESS_REQUEST,
  CREATE_PARTNER_ACCESS_SUCCESS,
} from '../constants/events';
import { getErrorMessage } from '../utils/errorMessage';
import logEvent from '../utils/logEvent';

const CreateAccessCodeForm = () => {
  const t = useTranslations('PartnerAdmin.createAccessCode');
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [formSubmitSuccess, setFormSubmitSuccess] = useState<boolean>(false);
  const [partnerAccessCode, setPartnerAccessCode] = useState<string | null>(null);
  const [formError, setFormError] = useState<
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();
  const [addPartnerAccess, { isLoading: addPartnerAccessIsLoading }] =
    useAddPartnerAccessMutation();

  const createPartnerAccess = async () => {
    const partnerAccessResponse = await addPartnerAccess({
      featureLiveChat: true,
      featureTherapy: true,
      therapySessionsRemaining: 6,
      therapySessionsRedeemed: 0,
    });

    if ('data' in partnerAccessResponse) {
      setPartnerAccessCode(partnerAccessResponse.data.accessCode);
    }

    if ('error' in partnerAccessResponse) {
      const error = partnerAccessResponse.error;
      const errorMessage = getErrorMessage(error);

      logEvent(CREATE_PARTNER_ACCESS_ERROR, { partner: 'bumble', message: errorMessage });
      rollbar.error('User register create user error', error);

      setFormError(t.rich('form.errors.createPartnerAccessError'));
      throw error;
    }
  };

  const submitHandler = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!selectedFeature) {
      setFormError(t.rich('form.errors.featureRequired'));
      return;
    }

    if (selectedFeature === 'courses') {
      const eventData = {
        partner: 'bumble',
        feature_courses: true,
        feature_live_chat: false,
        feature_therapy: false,
        therapy_sessions_total: 0,
      };
      logEvent(CREATE_PARTNER_ACCESS_REQUEST, eventData);
      logEvent(CREATE_PARTNER_ACCESS_SUCCESS, eventData);
    }

    if (selectedFeature === 'therapy') {
      const eventData = {
        partner: 'bumble',
        feature_courses: true,
        feature_live_chat: true,
        feature_therapy: true,
        therapy_sessions_total: 6,
      };

      logEvent(CREATE_PARTNER_ACCESS_REQUEST, eventData);
      await createPartnerAccess();
      logEvent(CREATE_PARTNER_ACCESS_SUCCESS, eventData);
    }

    setFormSubmitSuccess(true);
  };

  const resetForm = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setFormSubmitSuccess(false);
    setSelectedFeature(null);
  };

  const FormResetButton = () => (
    <Box>
      <Button sx={{ mt: 3 }} variant="contained" color="secondary" onClick={resetForm}>
        {t.rich('form.reset')}
      </Button>
    </Box>
  );

  const FormSuccessCourses = () => (
    <Box>
      <Typography variant="h4" component="h4" mb={1}>
        {t.rich('courseAccess')}
      </Typography>
      <Typography variant="body1" component="p">
        {t.rich('courseResultLink')}
      </Typography>
      <Link href={'https://www.bloom-pilot.chayn.co/bumble-welcome'}>
        https://www.bloom-pilot.chayn.co/bumble-welcome
      </Link>
      <Typography variant="body1" component="p">
        {t.rich('courseResultPassword')}{' '}
        <strong>{process.env.NEXT_PUBLIC_PILOT_COURSES_PASSWORD}</strong>
      </Typography>
      <FormResetButton />
    </Box>
  );

  const FormSuccessTherapy = () => (
    <Box>
      <Typography variant="h4" component="h4" mb={1}>
        {t.rich('therapyAccess')}
      </Typography>
      <Typography variant="body1" component="p">
        {t.rich('therapyResultLink')}
      </Typography>
      <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/welcome`}>
        {`${process.env.NEXT_PUBLIC_BASE_URL}/welcome`}
      </Link>
      <Typography variant="body1" component="p">
        {t.rich('therapyResultCode')} <strong>{partnerAccessCode}</strong>
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
          value={selectedFeature}
          onChange={(e) => setSelectedFeature(e.target.value)}
        >
          <FormControlLabel
            value="courses"
            control={<Radio />}
            label={t.rich('form.featureCoursesLabel')}
          />
          <FormControlLabel
            value="therapy"
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

  if (formSubmitSuccess && selectedFeature === 'courses') {
    return <FormSuccessCourses />;
  }
  if (formSubmitSuccess && selectedFeature === 'therapy') {
    return <FormSuccessTherapy />;
  }
  return <Form />;
};

export default CreateAccessCodeForm;
