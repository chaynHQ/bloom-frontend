import { KeyboardArrowDown } from '@mui/icons-material';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Autocomplete,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { RootState } from '../../app/store';
import { enCountries, esCountries } from '../../constants/countries';
import { LANGUAGES } from '../../constants/enums';
import {
  ABOUT_YOU_DEMO_ERROR,
  ABOUT_YOU_DEMO_REQUEST,
  ABOUT_YOU_DEMO_SUCCESS,
} from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import { rowStyle, staticFieldLabelStyle } from '../../styles/common';
import { hashString } from '../../utils/hashString';
import logEvent, { getEventUserData } from '../../utils/logEvent';

const rowStyles = {
  ...rowStyle,
  justifyContent: 'flex-start',

  '> label': {
    marginLeft: 0.25,
  },
} as const;

const actionsStyle = {
  ...rowStyle,
  justifyContent: 'flex-end',
  marginTop: 2,
};

const AboutYouDemographicForm = () => {
  const t = useTranslations('Account.aboutYou.demographicForm');
  const router = useRouter();

  const [eventUserData, setEventUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [genderInput, setGenderInput] = useState<Array<string>>([]);
  const [neurodivergentInput, setNeurodivergentInput] = useState<string>('');
  const [raceEthnNatn, setRaceEthnNatn] = useState<string>('');
  const [countryInput, setCountryInput] = useState<string>('');
  const [ageInput, setAgeInput] = useState<string>('');
  const [countryList, setCountryList] = useState<Array<{ code: string; label: string }>>([]);
  const [formError, setFormError] = useState<
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();
  const { user, partnerAccesses, partnerAdmin } = useTypedSelector((state: RootState) => state);

  useEffect(() => {
    if (router.locale === LANGUAGES.es) {
      setCountryList(esCountries);
    } else {
      setCountryList(enCountries);
    }
  }, [router.locale]);

  useEffect(() => {
    setEventUserData(getEventUserData({ user, partnerAccesses, partnerAdmin }));
  }, [user, partnerAccesses, partnerAdmin]);

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    logEvent(ABOUT_YOU_DEMO_REQUEST, eventUserData);

    const formData = {
      date: new Date().toISOString(),
      user_id: user.id && hashString(user.id),
      // Sort alphabetically the gender inputs and the make it into a string for the form
      gender: genderInput
        .map((gender) => gender.toLowerCase())
        .sort()
        .join(','),
      neurodivergent: neurodivergentInput,
      race_ethn_natn: raceEthnNatn,
      current_country: countryInput,
      age: ageInput,
      ...eventUserData, // add user data
    };

    // post to zapier webhook with the form + user data
    // the zap accepts the data and creates a new row in the google sheet
    // transformRequest required for cors issue see https://stackoverflow.com/a/63776819
    if (process.env.NEXT_PUBLIC_ZAPIER_WEBHOOK_DEMO_FORM) {
      axios
        .create({ transformRequest: [(data, _headers) => JSON.stringify(data)] })
        .post(process.env.NEXT_PUBLIC_ZAPIER_WEBHOOK_DEMO_FORM, formData)
        .then(function (response) {
          logEvent(ABOUT_YOU_DEMO_SUCCESS, eventUserData);

          // append `?q=a` to the url to reload the page and show the setA form instead
          router.query.q = 'a';
          router.push(router);
          setLoading(false);
        })
        .catch(function (error) {
          (window as any).Rollbar?.error(
            'Send zapier webhook about you demo form data error',
            error,
          );
          logEvent(ABOUT_YOU_DEMO_ERROR, {
            ...eventUserData,
            message: error,
          });
          setLoading(false);
          throw error;
        });
    }
  };

  const genderOptions = useMemo(() => t('genderOptions').split(';'), []);
  return (
    <Box mt={3}>
      <form autoComplete="off" onSubmit={submitHandler}>
        <Autocomplete
          id="gender"
          multiple
          value={genderInput}
          options={genderOptions.map((option) => option)}
          freeSolo
          onChange={(e, value) => setGenderInput(value)}
          renderTags={(value: readonly string[]) =>
            value.map((option: string, index: number) => (
              <Chip
                color="secondary"
                sx={{ marginBottom: 0.5, marginRight: 0.5 }}
                label={option}
                key={index}
              />
            ))
          }
          fullWidth
          renderInput={(params) => (
            <TextField
              {...params}
              helperText={t('genderHelpText')}
              InputLabelProps={{ shrink: true }}
              sx={staticFieldLabelStyle}
              variant="standard"
              label={t('genderLabel')}
              required={genderInput.length === 0} // required doesn't play nicely with an array value. It is expecting a string
            />
          )}
        />
        <FormControl required fullWidth component="fieldset" id="neurodivergent" sx={{ mb: 4 }}>
          <FormLabel component="legend">{t('neurodivergentLabel')}</FormLabel>
          <RadioGroup
            sx={rowStyles}
            aria-label="neurodivergent options"
            name="neurodivergent-radio-buttons-group"
            onChange={(e) => setNeurodivergentInput(e.target.value)}
            value={neurodivergentInput}
          >
            <FormControlLabel
              value="Yes"
              control={<Radio required />}
              label={t('neurodivergentLabels.1')}
            />
            <FormControlLabel
              value="No"
              control={<Radio required />}
              label={t('neurodivergentLabels.2')}
            />
            <FormControlLabel
              value="Not sure"
              control={<Radio required />}
              label={t('neurodivergentLabels.3')}
            />
          </RadioGroup>
          <FormHelperText sx={{ m: 0, mt: '0 !important' }}>
            {t('neurodivergentHelpText')}
          </FormHelperText>
        </FormControl>

        <TextField
          id="raceEthnNatn"
          label={t.rich('raceEthnNatnLabel')}
          helperText={t('raceEthnNatnHelpText')}
          onChange={(e) => setRaceEthnNatn(e.target.value)}
          value={raceEthnNatn}
          variant="standard"
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
          sx={staticFieldLabelStyle}
        />

        <Autocomplete
          disablePortal
          id="country"
          options={countryList}
          inputValue={countryInput}
          onInputChange={(event: any, newValue: string | null) => {
            setCountryInput(newValue || '');
          }}
          popupIcon={<KeyboardArrowDown />}
          renderInput={(params) => (
            <TextField
              {...params}
              required
              label={t('countryLabel')}
              variant="standard"
              helperText={t('countryHelpText')}
              InputLabelProps={{ shrink: true }}
              sx={staticFieldLabelStyle}
            />
          )}
        />

        <FormControl fullWidth component="fieldset" id="age">
          <FormLabel component="legend">{t('ageLabel')}</FormLabel>
          <RadioGroup
            sx={rowStyles}
            aria-label="age options"
            name="age-radio-buttons-group"
            onChange={(e) => setAgeInput(e.target.value)}
            value={ageInput}
          >
            <FormControlLabel
              value="Under 16"
              control={<Radio required />}
              label={t('ageLabels.1')}
            />
            <FormControlLabel value="16-25" control={<Radio required />} label={t('ageLabels.2')} />
            <FormControlLabel value="25-35" control={<Radio required />} label={t('ageLabels.3')} />
            <FormControlLabel value="35-45" control={<Radio required />} label={t('ageLabels.4')} />
            <FormControlLabel value="45-55" control={<Radio required />} label={t('ageLabels.5')} />
            <FormControlLabel value="55+" control={<Radio required />} label={t('ageLabels.6')} />
            <FormControlLabel
              value="Prefer not to say"
              control={<Radio required />}
              label={t('ageLabels.7')}
            />
          </RadioGroup>
        </FormControl>

        {formError && (
          <Typography color="error.main" mb={2}>
            {formError}
          </Typography>
        )}
        <Box sx={actionsStyle}>
          <LoadingButton variant="contained" color="secondary" type="submit" loading={loading}>
            {t('submitLabel')}
          </LoadingButton>
        </Box>
      </form>
    </Box>
  );
};

export default AboutYouDemographicForm;
