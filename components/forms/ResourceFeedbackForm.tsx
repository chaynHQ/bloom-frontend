'use client';

import { FEEDBACK_TAGS, RESOURCE_CATEGORIES } from '@/constants/enums';
import { useCreateResourceFeedbackMutation } from '@/lib/api';
import { ResourceFeedback } from '@/lib/store/resourcesSlice';
import illustrationPerson4Peach from '@/public/illustration_person4_peach.svg';
import { staticFieldLabelStyle } from '@/styles/common';
import { getImageSizes } from '@/utils/imageSizes';
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

export interface ResourceFeedbackFormProps {
  resourceId: string;
  category: RESOURCE_CATEGORIES;
}

const ResourceFeedbackForm = (props: ResourceFeedbackFormProps) => {
  const { resourceId, category } = props;

  const t = useTranslations('Resources.resourceFeedback');
  const tS = useTranslations('Shared');
  const [sendFeedback] = useCreateResourceFeedbackMutation();
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

    const feedbackData: ResourceFeedback = {
      resourceId: resourceId,
      feedbackTags: selectedFeedbackTag,
      feedbackDescription: feedbackDescription,
    };

    if (true) {
      await sendFeedback(feedbackData);
    }

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
          sizes={getImageSizes(imageContainerStyle.width)}
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
            name="feedback-radio-buttons"
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
          placeholder={t.rich('textboxDefaultText')?.toString()}
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

export default ResourceFeedbackForm;
