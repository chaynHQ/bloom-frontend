import LoadingButton from '@mui/lab/LoadingButton';
import { Divider, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Slider from '@mui/material/Slider';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { RootState } from '../../app/store';
import { DEFAULT_SCALE_START } from '../../constants/common';
import { ABOUT_YOU_SETC_REQUEST } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import { rowStyle, scaleTitleStyle } from '../../styles/common';
import { hashString } from '../../utils/hashString';
import { ScaleFieldItem } from '../../utils/interfaces';
import logEvent, { getEventUserData } from '../../utils/logEvent';

const actionsStyle = {
  ...rowStyle,
  justifyContent: 'flex-end',
  marginTop: 2,
};

const AboutYouSetCForm = () => {
  const t = useTranslations('Account.aboutYou.setCForm');
  const tBase = useTranslations('Account.aboutYou.baseForm');

  const [eventUserData, setEventUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [scale1Input, setScale1Input] = useState<number>(DEFAULT_SCALE_START);
  const [scale2Input, setScale2Input] = useState<number>(DEFAULT_SCALE_START);
  const [scale3Input, setScale3Input] = useState<number>(DEFAULT_SCALE_START);
  const [scale4Input, setScale4Input] = useState<number>(DEFAULT_SCALE_START);
  const [scale5Input, setScale5Input] = useState<number>(DEFAULT_SCALE_START);
  const [scale6Input, setScale6Input] = useState<number>(DEFAULT_SCALE_START);
  const [scale7Input, setScale7Input] = useState<number>(DEFAULT_SCALE_START);
  const [scale8Input, setScale8Input] = useState<number>(DEFAULT_SCALE_START);
  const [sinceBloomScale1Input, setSinceBloomScale1Input] = useState<number>(DEFAULT_SCALE_START);
  const [sinceBloomScale2Input, setSinceBloomScale2Input] = useState<number>(DEFAULT_SCALE_START);
  const [sinceBloomScale3Input, setSinceBloomScale3Input] = useState<number>(DEFAULT_SCALE_START);
  const [sinceBloomScale4Input, setSinceBloomScale4Input] = useState<number>(DEFAULT_SCALE_START);
  const [sinceBloomScale5Input, setSinceBloomScale5Input] = useState<number>(DEFAULT_SCALE_START);
  const [sinceBloomScale6Input, setSinceBloomScale6Input] = useState<number>(DEFAULT_SCALE_START);
  const [sinceBloomScale7Input, setSinceBloomScale7Input] = useState<number>(DEFAULT_SCALE_START);
  const [sinceBloomScale8Input, setSinceBloomScale8Input] = useState<number>(DEFAULT_SCALE_START);
  const [sinceBloomScale9Input, setSinceBloomScale9Input] = useState<number>(DEFAULT_SCALE_START);
  const [sinceBloomScale10Input, setSinceBloomScale10Input] = useState<number>(DEFAULT_SCALE_START);
  const [sinceBloomScale11Input, setSinceBloomScale11Input] = useState<number>(DEFAULT_SCALE_START);
  const [sinceBloomScale12Input, setSinceBloomScale12Input] = useState<number>(DEFAULT_SCALE_START);
  const [sinceBloomScale13Input, setSinceBloomScale13Input] = useState<number>(DEFAULT_SCALE_START);

  const [formError, setFormError] = useState<
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();
  const { user, partnerAccesses } = useTypedSelector((state: RootState) => state);

  const scaleQuestions: ScaleFieldItem[] = [
    { name: 'Q1', inputState: scale1Input, inputStateSetter: setScale1Input },
    { name: 'Q2', inputState: scale2Input, inputStateSetter: setScale2Input },
    { name: 'Q3', inputState: scale3Input, inputStateSetter: setScale3Input },
    { name: 'Q4', inputState: scale4Input, inputStateSetter: setScale4Input },
    { name: 'Q5', inputState: scale5Input, inputStateSetter: setScale5Input },
    { name: 'Q6', inputState: scale6Input, inputStateSetter: setScale6Input },
    { name: 'Q7', inputState: scale7Input, inputStateSetter: setScale7Input },
    { name: 'Q8', inputState: scale8Input, inputStateSetter: setScale8Input },
  ];

  const sinceBloomScaleQuestions: ScaleFieldItem[] = [
    { name: 'Q1', inputState: sinceBloomScale1Input, inputStateSetter: setSinceBloomScale1Input },
    { name: 'Q2', inputState: sinceBloomScale2Input, inputStateSetter: setSinceBloomScale2Input },
    { name: 'Q3', inputState: sinceBloomScale3Input, inputStateSetter: setSinceBloomScale3Input },
    { name: 'Q4', inputState: sinceBloomScale4Input, inputStateSetter: setSinceBloomScale4Input },
    { name: 'Q5', inputState: sinceBloomScale5Input, inputStateSetter: setSinceBloomScale5Input },
    { name: 'Q6', inputState: sinceBloomScale6Input, inputStateSetter: setSinceBloomScale6Input },
    { name: 'Q7', inputState: sinceBloomScale7Input, inputStateSetter: setSinceBloomScale7Input },
    { name: 'Q8', inputState: sinceBloomScale8Input, inputStateSetter: setSinceBloomScale8Input },
    { name: 'Q9', inputState: sinceBloomScale9Input, inputStateSetter: setSinceBloomScale9Input },
    {
      name: 'Q10',
      inputState: sinceBloomScale10Input,
      inputStateSetter: setSinceBloomScale10Input,
    },
    {
      name: 'Q11',
      inputState: sinceBloomScale11Input,
      inputStateSetter: setSinceBloomScale11Input,
    },
    {
      name: 'Q12',
      inputState: sinceBloomScale12Input,
      inputStateSetter: setSinceBloomScale12Input,
    },
    {
      name: 'Q13',
      inputState: sinceBloomScale13Input,
      inputStateSetter: setSinceBloomScale13Input,
    },
  ];

  useEffect(() => {
    setEventUserData(getEventUserData({ user, partnerAccesses }));
  }, [user, partnerAccesses]);

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    logEvent(ABOUT_YOU_SETC_REQUEST, eventUserData);
    const formData = {
      date: new Date().toISOString(),
      user_id: user.id && hashString(user.id),
      ...eventUserData, // add user data
    };
    scaleQuestions.forEach((question) => {
      formData[question.name.toLowerCase()] = question.inputState;
    });
    //   // post to zapier webhook with the form + user data
    //   // the zap accepts the data and creates a new row in the google sheet
    //   // transformRequest required for cors issue see https://stackoverflow.com/a/63776819
    //   if (process.env.NEXT_PUBLIC_ZAPIER_WEBHOOK_SETA_FORM) {
    //     axios
    //       .create({ transformRequest: [(data, _headers) => JSON.stringify(data)] })
    //       .post(process.env.NEXT_PUBLIC_ZAPIER_WEBHOOK_SETA_FORM, formData)
    //       .then(function (response) {
    //         logEvent(ABOUT_YOU_SETA_SUCCESS, eventUserData);
    //         router.push('/courses');
    //         setLoading(false);
    //       })
    //       .catch(function (error) {
    //         rollbar.error('Send zapier webhook about you demo form data error', error);
    //         logEvent(ABOUT_YOU_SETA_ERROR, {
    //           ...eventUserData,
    //           message: error,
    //         });
    //         setLoading(false);
    //         throw error;
    //       });
    //   }
  };

  function valuetext(value: number) {
    return `${value}°C`;
  }

  return (
    <Box mt={3}>
      <form autoComplete="off" onSubmit={submitHandler}>
        <Typography mb={1}>{tBase('scaleDescriptionLine1')}</Typography>
        <Typography mb="1.5rem !important" fontWeight="600">
          {tBase('scaleDescriptionLine2')}
        </Typography>
        {scaleQuestions.map((question) => (
          <FormControl key={`question-${question.name}`} fullWidth>
            <Typography sx={scaleTitleStyle}>{tBase(`scaleLabels.${question.name}`)}</Typography>
            <Slider
              aria-label={tBase(`scaleLabels.${question.name}`)}
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
        <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
        <Typography mb={1}>{tBase('scaleDescriptionLine1')}</Typography>
        <Typography mb="1.5rem !important" fontWeight="600">
          {tBase('scaleDescriptionLine2')}
        </Typography>
        <Typography mb="1.5rem !important" fontWeight="600">
          {t('sinceBloomLabel')}
        </Typography>
        {sinceBloomScaleQuestions.map((question) => (
          <FormControl key={`since-bloom-question-${question.name}`} fullWidth>
            <Typography sx={scaleTitleStyle}>
              {t(`sinceBloomScaleLabels.${question.name}`)}
            </Typography>
            <Slider
              aria-label={tBase(`sinceBloomScaleLabels.${question.name}`)}
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
            {tBase('submitLabel')}
          </LoadingButton>
        </Box>
      </form>
    </Box>
  );
};

export default AboutYouSetCForm;
