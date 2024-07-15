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
import { ISbStoryData } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import * as React from 'react';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useCreateSessionFeedbackMutation } from '../../app/api';
import { Course, Session, SessionFeedback } from '../../app/coursesSlice';
import { FEEDBACK_TAGS } from '../../constants/enums';
import { useTypedSelector } from '../../hooks/store';
import illustrationPerson4Peach from '../../public/illustration_person4_peach.svg';
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
  storyId: number;
  course: ISbStoryData;
}

const RateSessionForm = (props: RateSessionFormProps) => {
  const courses = useTypedSelector((state) => state.courses);
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

    const userCourse = courses.find((course: Course) => course.storyblokId === props.course.id);

    if (!userCourse) {
      setLoading(false);
      return;
    }

    const userSession = userCourse.sessions.find(
      (session: Session) => Number(session.storyblokId) === props.storyId,
    );

    if (!userSession) {
      setLoading(false);
      return;
    }

    const feedbackData: SessionFeedback = {
      sessionFeedbackId: uuidv4(),
      sessionId: userSession.id,
      feedbackTags: selectedFeedbackTag,
      feedbackDescription: feedbackDescription,
    };

    await sendFeedback(feedbackData);

    setLoading(false);
    setFormSubmitSuccess(true);
  };

  const FormSuccess = () => (
    <Box position="relative" alignContent="center" width="100%">
      <Typography variant="h3" component="h3" mb={1}>
        {t('submissionText')}
      </Typography>
      <Image
        alt={tS('alt.personTea')}
        src={illustrationPerson4Peach}
        sizes="(max-width: 2000px) 100vw"
        fill
        style={{
          objectFit: 'contain',
        }}
      />
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
            name="controlled-radio-buttons-group"
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
        {formError && <Typography color="error.main">{formError}</Typography>}

        <LoadingButton
          variant="contained"
          color="secondary"
          type="submit"
          loading={loading}
          disabled={!selectedFeedbackTag}
        >
          {t('sendButtonText')}
        </LoadingButton>
      </form>
    </>
  );
};

export default RateSessionForm;
