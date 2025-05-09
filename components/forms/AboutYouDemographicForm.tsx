'use client';

import { usePathname, useRouter } from '@/i18n/routing';
import countries from '@/lib/constants/countries';
import { LANGUAGES } from '@/lib/constants/enums';
import {
  ABOUT_YOU_DEMO_ERROR,
  ABOUT_YOU_DEMO_REQUEST,
  ABOUT_YOU_DEMO_SUCCESS,
} from '@/lib/constants/events';
import { genderOptions } from '@/lib/constants/gender';
import { useTypedSelector } from '@/lib/hooks/store';
import { hashString } from '@/lib/utils/hashString';
import logEvent, { getEventUserData } from '@/lib/utils/logEvent';
import { rowStyle, staticFieldLabelStyle } from '@/styles/common';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { useRollbar } from '@rollbar/react';
import axios from 'axios';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { JSXElementConstructor, ReactElement, ReactNode, useEffect, useState } from 'react';

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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rollbar = useRollbar();
  const locale = useLocale();

  const [eventUserData, setEventUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [genderInput, setGenderInput] = useState<Array<string>>([]);
  const [genderTextInput, setGenderTextInput] = useState<string>('');
  const [neurodivergentInput, setNeurodivergentInput] = useState<string>('');
  const [raceEthnNatn, setRaceEthnNatn] = useState<string>('');
  const [countryInput, setCountryInput] = useState<{
    code: string;
    label: string;
  } | null>(null);
  const [countryTextInput, setCountryTextInput] = useState<string>('');
  const [ageInput, setAgeInput] = useState<string>('');
  const [countryList, setCountryList] = useState<
    Array<{
      code: string;
      label: string;
    }>
  >([]);
  const [formError] = useState<
    string | ReactNode[] | ReactElement<any, string | JSXElementConstructor<any>>
  >();
  const userId = useTypedSelector((state) => state.user.id);
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

  useEffect(() => {
    if (locale) {
      setCountryList(
        countries.map((c: { code: string; label: { [key: string]: string } }) => ({
          code: c.code,
          label: locale ? c.label[locale] : c.label.en,
        })),
      );
    }
  }, [locale]);

  useEffect(() => {
    setEventUserData(getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin));
  }, [userCreatedAt, partnerAccesses, partnerAdmin]);

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    logEvent(ABOUT_YOU_DEMO_REQUEST, eventUserData);

    const genderOptionsSelected: string[] = [];
    const genderFreeText: string[] = [];

    genderInput.forEach((input) => {
      const matchedGenderOption = genderOptions.find(
        (option) => t(`genderOptions.${option.translationLabel}`) === input,
      );

      if (matchedGenderOption) {
        genderOptionsSelected.push(matchedGenderOption.englishLabel);
      } else {
        genderFreeText.push(input.toLowerCase());

        if (!genderOptionsSelected.includes('other')) {
          genderOptionsSelected.push('other');
        }
      }
    });

    const formData = {
      date: new Date().toISOString(),
      user_id: userId && hashString(userId),
      // Sort alphabetically the gender inputs and the make it into a string for the form
      gender: genderInput
        .map((gender) => gender.toLowerCase())
        .sort()
        .join(','),
      gender_options: genderOptionsSelected.sort().join(','),
      gender_free_text: genderFreeText.sort().join(','),
      neurodivergent: neurodivergentInput,
      race_ethn_natn: raceEthnNatn,
      current_country: countries.find((c) => c.code === countryInput?.code)?.label.en,
      age: ageInput,
      language: locale as LANGUAGES,
      ...eventUserData, // add user data
    };

    // post to zapier webhook with the form + user data
    // the zap accepts the data and creates a new row in the google sheet
    // transformRequest required for cors issue see https://stackoverflow.com/a/63776819
    if (process.env.NEXT_PUBLIC_ZAPIER_WEBHOOK_DEMO_FORM) {
      axios
        .create({ transformRequest: [(data) => JSON.stringify(data)] })
        .post(process.env.NEXT_PUBLIC_ZAPIER_WEBHOOK_DEMO_FORM, formData)
        .then(function () {
          logEvent(ABOUT_YOU_DEMO_SUCCESS, eventUserData);

          // append `?q=a` to the url to reload the page and show the setA form instead
          router.push({ pathname, query: { q: 'a' } });
          setLoading(false);
        })
        .catch(function (error) {
          rollbar.error('Send zapier webhook about you demo form data error', error);

          logEvent(ABOUT_YOU_DEMO_ERROR, {
            ...eventUserData,
            message: error,
          });
          setLoading(false);
          throw error;
        });
    }
  };

  return (
    <Box mt={3}>
      <form autoComplete="off" onSubmit={submitHandler}>
        <FormControl fullWidth component="fieldset" sx={{ mb: 4 }}>
          <FormLabel component="legend" sx={{ mb: 2 }}>
            {t('genderLabel')}
          </FormLabel>
          <Autocomplete
            id="gender"
            multiple
            value={genderInput}
            inputValue={genderTextInput}
            options={genderOptions.map((option) => t(`genderOptions.${option.translationLabel}`))}
            freeSolo
            onChange={(e, value) => {
              setGenderInput(value);
            }}
            onInputChange={(e, value) => {
              setGenderTextInput(value);
            }}
            onBlur={() => {
              if (genderTextInput) {
                setGenderInput([...genderInput, genderTextInput]);
                setGenderTextInput('');
              }
            }}
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
                InputLabelProps={{ shrink: true }}
                sx={staticFieldLabelStyle}
                variant="standard"
                required={genderInput.length === 0}
              />
            )}
          />
          <FormHelperText sx={{ m: 0, mt: '0 !important' }}>{t('genderHelpText')}</FormHelperText>
        </FormControl>

        <FormControl fullWidth component="fieldset" sx={{ mb: 4 }}>
          <FormLabel component="legend" sx={{ mb: 2 }}>
            {t('neurodivergentLabel')}
          </FormLabel>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'nowrap',
              gap: 2,
              '& .MuiFormControlLabel-root': {
                margin: 0,
                flex: '0 0 auto',
              },
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={neurodivergentInput === 'Yes'}
                  onChange={(e) => setNeurodivergentInput(e.target.checked ? 'Yes' : '')}
                  sx={{
                    '& .MuiSvgIcon-root': {
                      color: '#FF976A',
                    },
                    '&.Mui-checked .MuiSvgIcon-root': {
                      color: '#FF976A',
                    },
                    '&:hover .MuiSvgIcon-root': {
                      color: '#FF976A',
                    },
                    '&.Mui-checked:hover .MuiSvgIcon-root': {
                      color: '#FF976A',
                    },
                  }}
                />
              }
              label={t('neurodivergentLabels.1')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={neurodivergentInput === 'No'}
                  onChange={(e) => setNeurodivergentInput(e.target.checked ? 'No' : '')}
                  sx={{
                    '& .MuiSvgIcon-root': {
                      color: '#FF976A',
                    },
                    '&.Mui-checked .MuiSvgIcon-root': {
                      color: '#FF976A',
                    },
                    '&:hover .MuiSvgIcon-root': {
                      color: '#FF976A',
                    },
                    '&.Mui-checked:hover .MuiSvgIcon-root': {
                      color: '#FF976A',
                    },
                  }}
                />
              }
              label={t('neurodivergentLabels.2')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={neurodivergentInput === 'Not sure'}
                  onChange={(e) => setNeurodivergentInput(e.target.checked ? 'Not sure' : '')}
                  sx={{
                    '& .MuiSvgIcon-root': {
                      color: '#FF976A',
                    },
                    '&.Mui-checked .MuiSvgIcon-root': {
                      color: '#FF976A',
                    },
                    '&:hover .MuiSvgIcon-root': {
                      color: '#FF976A',
                    },
                    '&.Mui-checked:hover .MuiSvgIcon-root': {
                      color: '#FF976A',
                    },
                  }}
                />
              }
              label={t('neurodivergentLabels.3')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={neurodivergentInput === 'Prefer not to say'}
                  onChange={(e) =>
                    setNeurodivergentInput(e.target.checked ? 'Prefer not to say' : '')
                  }
                  sx={{
                    '& .MuiSvgIcon-root': {
                      color: '#FF976A',
                    },
                    '&.Mui-checked .MuiSvgIcon-root': {
                      color: '#FF976A',
                    },
                    '&:hover .MuiSvgIcon-root': {
                      color: '#FF976A',
                    },
                    '&.Mui-checked:hover .MuiSvgIcon-root': {
                      color: '#FF976A',
                    },
                  }}
                />
              }
              label={t('neurodivergentLabels.4')}
            />
          </Box>
          <FormHelperText sx={{ m: 0, mt: '0 !important' }}>
            {t('neurodivergentHelpText')}
          </FormHelperText>
        </FormControl>

        <FormControl fullWidth component="fieldset" sx={{ mb: 4 }}>
          <FormLabel component="legend" sx={{ mb: 2 }}>
            {t.rich('raceEthnNatnLabel')}
          </FormLabel>
          <TextField
            id="raceEthnNatn"
            onChange={(e) => setRaceEthnNatn(e.target.value)}
            value={raceEthnNatn}
            variant="standard"
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={staticFieldLabelStyle}
          />
          <FormHelperText sx={{ m: 0, mt: '0 !important' }}>
            {t('raceEthnNatnHelpText')}
          </FormHelperText>
        </FormControl>

        <FormControl fullWidth component="fieldset" sx={{ mb: 4 }}>
          <FormLabel component="legend" sx={{ mb: 2 }}>
            {t('countryLabel')}
          </FormLabel>
          <Autocomplete
            disablePortal
            id="country"
            options={countryList}
            getOptionLabel={(option: { code: string; label: string }) => {
              return option.label;
            }}
            inputValue={countryTextInput}
            value={countryInput}
            onInputChange={(event: any, newValue: string | null) => {
              setCountryTextInput(newValue || '');
            }}
            onChange={(e, value) => {
              setCountryInput(value || null);
            }}
            popupIcon={<KeyboardArrowDown />}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                variant="standard"
                InputLabelProps={{ shrink: true }}
                sx={staticFieldLabelStyle}
              />
            )}
          />
          <FormHelperText sx={{ m: 0, mt: '0 !important' }}>{t('countryHelpText')}</FormHelperText>
        </FormControl>

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
              value="Under 18"
              control={<Radio required />}
              label={t('ageLabels.1')}
            />
            <FormControlLabel value="18-25" control={<Radio required />} label={t('ageLabels.2')} />
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
