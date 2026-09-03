'use client';

import { useCreateResourceFeedbackMutation } from '@/lib/api';
import { FEEDBACK_TAGS, RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import { RESOURCE_FEEDBACK_SUBMITTED } from '@/lib/constants/events';
import logEvent from '@/lib/utils/logEvent';
import { ResourceFeedback } from '@/lib/store/resourcesSlice';
import { getImageSizes } from '@/lib/utils/imageSizes';
import illustrationPerson4Peach from '@/public/illustration_person4_peach.svg';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, FormControl, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import * as React from 'react';
import { useState } from 'react';

const radioGroupStyle = {
  width: '100%',
  justifyContent: 'center',
  py: 1,
  label: {
    margin: 0,
    width: { xs: '33%', sm: 150 },
  },
} as const;

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

interface ResourceFeedbackFormProps {
  resourceId: string;
  category: RESOURCE_CATEGORIES;
  onSubmitted?: () => void;
}

const ResourceFeedbackForm = (props: ResourceFeedbackFormProps) => {
  const { resourceId, category, onSubmitted } = props;

  const t = useTranslations('Resources.resourceFeedback');
  const tS = useTranslations('Shared');
  const [sendFeedback] = useCreateResourceFeedbackMutation();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFeedbackTag, setSelectedFeedbackTag] = useState<FEEDBACK_TAGS | null>(null);
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

    const feedbackData: ResourceFeedback = {
      resourceId: resourceId,
      feedbackTags: selectedFeedbackTag,
      feedbackDescription: '',
    };

    await sendFeedback(feedbackData);

    logEvent(RESOURCE_FEEDBACK_SUBMITTED, { category, feedbackTags: selectedFeedbackTag });
    setLoading(false);
    setFormSubmitSuccess(true);
    onSubmitted?.();
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
      <Typography component="h2" variant="h4" sx={{ mb: 0.5 }}>
        {t('title')}
      </Typography>
      <Typography variant="body2" sx={{ color: 'grey.700', mb: 2 }}>
        {t('subtitle')}
      </Typography>
      <form autoComplete="off" onSubmit={submitHandler}>
        <FormControl fullWidth component="fieldset">
          <RadioGroup
            row
            sx={radioGroupStyle}
            aria-label={t('title')}
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

        {formError && <Typography sx={{ color: 'error.main', mb: 2 }}>{formError}</Typography>}

        <LoadingButton
          variant="contained"
          color="error"
          type="submit"
          loading={loading}
          sx={{ mt: 1 }}
        >
          {t('sendButtonText')}
        </LoadingButton>
      </form>
    </>
  );
};

export default ResourceFeedbackForm;
