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
import Link from '../components/Link';

const CreateAccessCodeForm = () => {
  const t = useTranslations('PartnerAdmin.createAccessCode');
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [formSubmitSuccess, setFormSubmitSuccess] = useState<boolean>(false);
  const [formError, setFormError] = useState<
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();

  const submitHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!selectedFeature) {
      setFormError(t.rich('form.errors.featureRequired'));
      return;
    }
    console.log(selectedFeature);
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

  if (formSubmitSuccess) {
    if (selectedFeature === 'courses') {
      return (
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
    } else {
      return (
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
            {t.rich('therapyResultCode')} <strong>CODE</strong>
          </Typography>
          <FormResetButton />
        </Box>
      );
    }
  }

  return (
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
};

export default CreateAccessCodeForm;
