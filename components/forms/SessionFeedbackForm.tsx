'use client';

import SanitizedTextField from '@/components/common/SanitizedTextField';
import { useCreateSessionFeedbackMutation } from '@/lib/api';
import { FEEDBACK_TAGS } from '@/lib/constants/enums';
import { SESSION_FEEDBACK_SUBMITTED } from '@/lib/constants/events';
import { SessionFeedback } from '@/lib/store/coursesSlice';
import { getImageSizes } from '@/lib/utils/imageSizes';
import logEvent from '@/lib/utils/logEvent';
import illustrationPerson4Peach from '@/public/illustration_person4_peach.svg';
import { staticFieldLabelStyle } from '@/styles/common';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import * as React from 'react';
import { useState } from 'react';

// A subtle tinted fill plus a hairline sets the comment box apart from the card behind it.
const fieldBoxStyle: SxProps<Theme> = {
  ...staticFieldLabelStyle,
  '& .MuiFilledInput-root': {
    backgroundColor: 'sectionSurface',
    border: '1px solid',
    borderColor: 'inputBorder',
    borderRadius: '12px',
    padding: '12px',
    '&:hover': {
      backgroundColor: 'panelSurface',
    },
    '&.Mui-focused': {
      backgroundColor: 'panelSurface',
      borderColor: 'secondary.dark',
    },
  },
};

// A fixed column count keeps every option on a single line rather than letting the longer
// labels ("Too complicated") wrap inside a narrow flex track.
const radioGroupStyle = {
  width: '100%',
  display: 'grid',
  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
  gap: 1,
  py: 2.5,
  label: {
    margin: 0,
    padding: 1,
    width: '100%',
  },
} as const;

interface SessionFeedbackFormProps {
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

const SessionFeedbackForm = (props: SessionFeedbackFormProps) => {
  const t = useTranslations('Courses.sessionFeedback');
  const tS = useTranslations('Shared');
  const [sendFeedback] = useCreateSessionFeedbackMutation();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFeedbackTag, setSelectedFeedbackTag] = useState<FEEDBACK_TAGS | null>(null);
  const [feedbackDescription, setFeedbackDescription] = useState<string>('');
  const [formSubmitSuccess, setFormSubmitSuccess] = useState<boolean>(false);
  const [formError, setFormError] = useState<
    string | React.ReactNode[] | React.ReactElement<any, string | React.JSXElementConstructor<any>>
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

    if (true) {
      await sendFeedback(feedbackData);
    }

    logEvent(SESSION_FEEDBACK_SUBMITTED, { feedbackTags: selectedFeedbackTag });
    setLoading(false);
    setFormSubmitSuccess(true);
  };

  if (formSubmitSuccess) {
    return (
      <Box sx={containerStyle}>
        <Typography component="h3" variant="h3">
          {t('submissionText')}
        </Typography>
        <Box sx={imageContainerStyle}>
          <Image
            alt={tS('alt.personTea')}
            src={illustrationPerson4Peach}
            fill
            sizes={getImageSizes(imageContainerStyle.width)}
            style={{
              objectFit: 'contain',
            }}
          />
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Typography>{t('subtitle')}</Typography>
      <form autoComplete="off" onSubmit={submitHandler}>
        <FormControl fullWidth component="fieldset">
          <RadioGroup
            sx={radioGroupStyle}
            aria-label="feature"
            name="feedback-radio-buttons"
            value={selectedFeedbackTag}
            onChange={(e) => setSelectedFeedbackTag(e.target.value as FEEDBACK_TAGS)}
          >
            {Object.entries(FEEDBACK_TAGS).map(([_, tagText]) => (
              <FormControlLabel
                key={`feedbackTags.${_}`}
                value={tagText}
                control={<Radio />}
                label={t(`feedbackTags.${tagText}`)}
                labelPlacement="bottom"
              />
            ))}
          </RadioGroup>
        </FormControl>

        <SanitizedTextField
          id="feedbackDescription"
          placeholder={t.rich('textboxDefaultText')?.toString()}
          onChange={setFeedbackDescription}
          value={feedbackDescription}
          sx={fieldBoxStyle}
          variant="filled"
          fullWidth
          multiline
          rows={5}
          slotProps={{ input: { disableUnderline: true }, inputLabel: { shrink: true } }}
        />
        {formError && (
          <Typography
            sx={{
              color: 'error.main',
              '&:last-of-type': { mb: 4 },
            }}
          >
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

export default SessionFeedbackForm;
