import LoadingButton from '@mui/lab/LoadingButton';
import {
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  SxProps,
  TextField,
  Theme,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import * as React from 'react';
import { useState } from 'react';
import { FEEDBACK_TAGS } from '../../constants/enums';
import illustrationPerson4Peach from '../../public/illustration_person4_peach.svg';
import { useCreateSessionFeedbackMutation } from '../../store/api';
import { SessionFeedback } from '../../store/coursesSlice';
import { staticFieldLabelStyle } from '../../styles/common';

const fieldBoxStyle: SxProps<Theme> = {
  ...staticFieldLabelStyle,
  '& .MuiFilledInput-root': {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '12px 12px',
  },
};

const radioGroupStyle = {
  padding: '20px 0px',
} as const;

export interface RateSessionFormProps {
  sessionId: string;
}

const imageContainerStyle = {
  position: 'relative', // needed for next/image to fill the container
  width: 200,
  height: 200,
} as const;

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
} as const;

const RateSessionForm = (props: RateSessionFormProps) => {
  const t = useTranslations('Courses.sessionFeedback');
  const tS = useTranslations('Shared');
  const [sendFeedback] = useCreateSessionFeedbackMutation();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFeedbackTag, setSelectedFeedbackTag] = useState<FEEDBACK_TAGS | null>(null);
  const [feedbackDescription, setFeedbackDescription] = useState<string>('');
  const [formSubmitSuccess, setFormSubmitSuccess] = useState<boolean>(false);
  const [formError, setFormError] = useState<
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!selectedFeedbackTag) {
      setFormError(t('errors.feedbackTagError'));
      setLoading(false);
      return;
    }

    const feedbackData: SessionFeedback = {
      sessionId: props.sessionId,
      feedbackTags: selectedFeedbackTag,
      feedbackDescription: feedbackDescription,
    };

    await sendFeedback(feedbackData);

    setLoading(false);
    setFormSubmitSuccess(true);
  };

  const FormSuccess = () => (
    <Box sx={containerStyle}>
      <Typography component="h3" variant="h3">
        {t('submissionText')}
      </Typography>
      <Box sx={imageContainerStyle}>
        <Image
          alt={tS('alt.personTea')}
          src={illustrationPerson4Peach}
          fill
          sizes="100vw"
          style={{
            objectFit: 'contain',
          }}
        />
      </Box>
    </Box>
  );

  if (formSubmitSuccess) {
    return <FormSuccess />;
  }

  return (
    <>
      <Typography component="h2" variant="h2">
        {t('title')}
      </Typography>
      <Typography>{t('subtitle')}</Typography>
      <form autoComplete="off" onSubmit={submitHandler}>
        <FormControl fullWidth component="fieldset">
          <RadioGroup
            row
            sx={radioGroupStyle}
            aria-label="feature"
            name="session-feedback-radio-buttons"
            value={selectedFeedbackTag}
            onChange={(e) => setSelectedFeedbackTag(e.target.value as FEEDBACK_TAGS)}
          >
            {Object.entries(FEEDBACK_TAGS).map(([_, tagText]) => (
              <FormControlLabel
                key={`feedbackTags.${tagText}`}
                value={tagText}
                control={<Radio />}
                label={t(`feedbackTags.${tagText}`)}
                labelPlacement="bottom"
              />
            ))}
          </RadioGroup>
        </FormControl>

        <TextField
          id="feedbackDescription"
          placeholder={t.rich('textboxDefaultText').toString()}
          onChange={(e) => setFeedbackDescription(e.target.value)}
          value={feedbackDescription}
          sx={fieldBoxStyle}
          variant="filled"
          fullWidth
          multiline
          rows={5}
          InputProps={{ disableUnderline: true }}
          InputLabelProps={{ shrink: true }}
        />
        {formError && (
          <Typography sx={{ '&:last-of-type': { mb: 4 } }} color="error.main">
            {formError}
          </Typography>
        )}

        <LoadingButton variant="contained" color="secondary" type="submit" loading={loading}>
          {t('sendButtonText')}
        </LoadingButton>
      </form>
    </>
  );
};

export default RateSessionForm;
