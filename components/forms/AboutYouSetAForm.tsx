import LoadingButton from '@mui/lab/LoadingButton';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { RootState } from '../../app/store';
import { enCountries, esCountries } from '../../constants/countries';
import { LANGUAGES } from '../../constants/enums';
import { ABOUT_YOU_DEMO_REQUEST } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import { rowStyle, scaleTitleStyle, staticFieldLabelStyle } from '../../styles/common';
import logEvent, { getEventUserData } from '../../utils/logEvent';

const actionsStyle = {
  ...rowStyle,
  justifyContent: 'flex-end',
  marginTop: 2,
};

const AboutYouSetAForm = () => {
  const t = useTranslations('Account.aboutYou.setAForm');
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
      ...getEventUserData({ user, partnerAccesses }),
    };

    console.log(data);
    router.push('/courses');

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

  function valuetext(value: number) {
    return `${value}°C`;
  }

  return (
    <Box mt={3}>
      <form autoComplete="off" onSubmit={submitHandler}>
        <TextField
          id="hopes"
          label={t.rich('hopesLabel')}
          onChange={(e) => setGenderInput(e.target.value)}
          value={genderInput}
          variant="standard"
          fullWidth
          required
          multiline
          rows={3}
          InputLabelProps={{ shrink: true }}
          sx={staticFieldLabelStyle}
        />
        <Typography mb={1}>{t('scaleDescriptionLine1')}</Typography>
        <Typography mb="1.5rem !important">{t('scaleDescriptionLine2')}</Typography>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((x) => (
          <FormControl key={`question-${x}`} fullWidth>
            <Typography sx={scaleTitleStyle}>{t(`scaleLabels.${x}`)}</Typography>
            <Slider
              aria-label={t(`scaleLabels.${x}`)}
              defaultValue={3}
              getAriaValueText={valuetext}
              valueLabelDisplay="auto"
              step={1}
              marks
              min={1}
              max={10}
              color="secondary"
            />
          </FormControl>
        ))}

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

export default AboutYouSetAForm;
