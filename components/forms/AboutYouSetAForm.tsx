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
import { ABOUT_YOU_DEMO_REQUEST } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import { rowStyle, scaleTitleStyle, staticFieldLabelStyle } from '../../styles/common';
import { ScaleFieldItem } from '../../utils/interfaces';
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
  const [hopesInput, setHopesInput] = useState<string>('');
  const [scale1Input, setScale1Input] = useState<number>(3);
  const [scale2Input, setScale2Input] = useState<number>(3);
  const [scale3Input, setScale3Input] = useState<number>(3);
  const [scale4Input, setScale4Input] = useState<number>(3);
  const [scale5Input, setScale5Input] = useState<number>(3);
  const [scale6Input, setScale6Input] = useState<number>(3);
  const [scale7Input, setScale7Input] = useState<number>(3);
  const [formError, setFormError] = useState<
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();
  const { user, partnerAccesses } = useTypedSelector((state: RootState) => state);

  const scaleQuestions: ScaleFieldItem[] = [
    { name: '1', inputState: scale1Input, inputStateSetter: setScale1Input },
    { name: '2', inputState: scale2Input, inputStateSetter: setScale2Input },
    { name: '3', inputState: scale3Input, inputStateSetter: setScale3Input },
    { name: '4', inputState: scale4Input, inputStateSetter: setScale4Input },
    { name: '5', inputState: scale5Input, inputStateSetter: setScale5Input },
    { name: '6', inputState: scale6Input, inputStateSetter: setScale6Input },
    { name: '7', inputState: scale7Input, inputStateSetter: setScale7Input },
  ];

  useEffect(() => {
    setEventUserData(getEventUserData({ user, partnerAccesses }));
  }, [user, partnerAccesses]);

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    logEvent(ABOUT_YOU_DEMO_REQUEST, eventUserData);

    const data = {
      ...eventUserData,
    };

    scaleQuestions.forEach((question) => {
      data[question.name] = question.inputState;
    });

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
          onChange={(e) => setHopesInput(e.target.value)}
          value={hopesInput}
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
        {scaleQuestions.map((question) => (
          <FormControl key={`question-${question.name}`} fullWidth>
            <Typography sx={scaleTitleStyle}>{t(`scaleLabels.${question.name}`)}</Typography>
            <Slider
              aria-label={t(`scaleLabels.${question.name}`)}
              value={question.inputState}
              onChange={(e, newValue) => question.inputStateSetter(newValue as number)}
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
