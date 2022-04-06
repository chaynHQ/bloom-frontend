import { KeyboardArrowDown } from '@mui/icons-material';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Autocomplete,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { RootState } from '../../app/store';
import { enCountries, esCountries } from '../../constants/countries';
import { LANGUAGES } from '../../constants/enums';
import { ABOUT_YOU_DEMO_REQUEST } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import { rowStyle, staticFieldLabelStyle } from '../../styles/common';
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

const AboutYouDemoForm = () => {
  const t = useTranslations('Account.aboutYou.demoForm');
  const router = useRouter();

  const [eventUserData, setEventUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [genderInput, setGenderInput] = useState<string>('');
  const [neurodivergentInput, setNeurodivergentInput] = useState<string>('');
  const [homeInput, setHomeInput] = useState<string>('');
  const [countryInput, setCountryInput] = useState<string>('');
  const [ageInput, setAgeInput] = useState<string>('');
  const [countryList, setCountryList] = useState<Array<{ code: string; label: string }>>([]);
  const [formError, setFormError] = useState<
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();
  const { user, partnerAccesses } = useTypedSelector((state: RootState) => state);

  useEffect(() => {
    if (router.locale === LANGUAGES.es) {
      setCountryList(esCountries);
    } else {
      setCountryList(enCountries);
    }
  }, [router.locale]);

  useEffect(() => {
    setEventUserData(getEventUserData({ user, partnerAccesses }));
  }, [user, partnerAccesses]);

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    logEvent(ABOUT_YOU_DEMO_REQUEST, eventUserData);

    const data = {
      gender: genderInput,
      neurodivergent: neurodivergentInput,
      home_country: homeInput,
      current_country: countryInput,
      age: ageInput,
      ...eventUserData,
    };

    console.log(data);
    router.query.q = 'a';
    router.push(router);

    // if ('success') {
    //   logEvent(ASSIGN_NEW_PARTNER_ACCESS_SUCCESS, { ...eventUserData, ...eventData });
    //   setLoading(false);
    // }

    // if ('error') {
    //   const error = getErrorMessage(error);

    //     rollbar.error('Assign partner access error', error);
    //     logEvent(ASSIGN_NEW_PARTNER_ACCESS_ERROR, {
    //       ...eventUserData,
    //       message: error,
    //     });
    //     setLoading(false);
    //     throw error;
    // }
  };

  return (
    <Box mt={3}>
      <form autoComplete="off" onSubmit={submitHandler}>
        <TextField
          id="gender"
          label={t.rich('genderLabel')}
          onChange={(e) => setGenderInput(e.target.value)}
          value={genderInput}
          variant="standard"
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
          sx={staticFieldLabelStyle}
        />

        <FormControl
          required
          fullWidth
          component="fieldset"
          id="neurodivergent"
          sx={{ marginBottom: 3 }}
        >
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
        </FormControl>

        <Autocomplete
          disablePortal
          id="home"
          options={countryList}
          inputValue={homeInput}
          onInputChange={(event: any, newValue: string | null) => {
            setHomeInput(newValue || '');
          }}
          popupIcon={<KeyboardArrowDown />}
          renderInput={(params) => (
            <TextField
              {...params}
              required
              label={t('homeLabel')}
              variant="standard"
              helperText={t('homeHelpText')}
              InputLabelProps={{ shrink: true }}
              sx={staticFieldLabelStyle}
            />
          )}
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

export default AboutYouDemoForm;
