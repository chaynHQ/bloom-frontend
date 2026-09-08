'use client';

import SanitizedTextField from '@/components/common/SanitizedTextField';
import {
  BUG_BLOCKING_OPTIONS,
  CONTACT_REASONS,
  ContactFormValues,
  FEEDBACK_TAGS,
  FeedbackTag,
} from '@/lib/utils/contactForm';
import {
  Box,
  Collapse,
  Link,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { ReactNode, useState } from 'react';
import { OptionalTag } from './ContactFormParts';

// The label is a sibling element rather than MUI's built-in label, so it isn't
// subject to the input variant's reserved label spacing. `htmlFor`/`id` pairs them.
const fieldLabelStyle = {
  display: 'block',
  fontWeight: 600,
  fontSize: '0.95rem',
  lineHeight: 1.4,
  color: 'text.primary',
  mb: 0.5,
} as const;

export const LabelledField = ({
  id,
  label,
  optional,
  children,
}: {
  id: string;
  label: ReactNode;
  optional?: boolean;
  children: ReactNode;
}) => (
  <Box sx={{ mb: 3 }}>
    <Typography component="label" htmlFor={id} sx={fieldLabelStyle}>
      {label}
      {optional && <OptionalTag />}
    </Typography>
    {children}
  </Box>
);

// The app's rounded input treatment (as SessionFeedbackForm's fieldBoxStyle):
// tinted fill, hairline border, 12px radius and padding. `hiddenLabel` removes
// the filled variant's label gap since LabelledField renders the label.
const roundedFieldStyle = {
  mb: 0,
  '& .MuiFilledInput-root': {
    backgroundColor: 'sectionSurface',
    border: '1px solid',
    borderColor: 'inputBorder',
    borderRadius: '12px',
    overflow: 'hidden',
    padding: '12px',
    transition: 'background-color 120ms ease, border-color 120ms ease',
    '&:hover': { backgroundColor: 'panelSurface', borderColor: 'primary.dark' },
    '&.Mui-focused': { backgroundColor: 'panelSurface', borderColor: 'secondary.main' },
    '&::before, &::after': { display: 'none' },
  },
  '& .MuiFilledInput-input': { padding: 0 },
  '& .MuiFilledInput-input::placeholder': { opacity: 0.7 },
  '& .MuiFormHelperText-root': {
    fontSize: '0.8125rem',
    color: 'grey.700',
    marginTop: '0.375rem !important',
    marginInline: 0,
  },
} as const;

export const contactTextFieldProps = {
  variant: 'filled' as const,
  hiddenLabel: true,
  fullWidth: true,
  slotProps: { input: { disableUnderline: true } },
  sx: roundedFieldStyle,
};

const groupLabelStyle = {
  ...fieldLabelStyle,
  mb: 1.25,
} as const;

// The same pill treatment as the Library page's kind toggle.
const pillToggleStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 1,
  '& .MuiToggleButtonGroup-grouped': {
    m: 0,
    border: '1px solid',
    borderColor: 'secondary.main',
    borderRadius: '100px !important',
    px: 2,
    py: 0.75,
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.4,
    textTransform: 'none',
    color: 'grey.800',
    backgroundColor: 'common.white',
    '&:hover': { backgroundColor: 'secondary.light' },
    '&.Mui-selected': {
      color: 'grey.900',
      borderColor: 'secondary.dark',
      backgroundColor: 'secondary.main',
      '&:hover': { backgroundColor: 'secondary.main' },
    },
  },
} as const;

export interface FieldSetProps {
  values: ContactFormValues;
  patch: (patch: Partial<ContactFormValues>) => void;
}

export const BugFields = ({ values, patch }: FieldSetProps) => {
  const t = useTranslations('Contact.bug');
  // Auto-expand the extra detail if a caller pre-filled it (e.g. the error page).
  const [showMore, setShowMore] = useState(!!values.bugContext || !!values.bugExpected);

  return (
    <>
      <LabelledField id="contactMessage" label={t('messageLabel')}>
        <SanitizedTextField
          {...contactTextFieldProps}
          id="contactMessage"
          placeholder={t('messagePlaceholder')}
          value={values.message}
          onChange={(v) => patch({ message: v })}
          required
          multiline
          minRows={3}
        />
      </LabelledField>

      <Box sx={{ mb: 3 }}>
        <Typography component="div" sx={groupLabelStyle}>
          {t('blockingLabel')}
          <OptionalTag />
        </Typography>
        <ToggleButtonGroup
          value={values.bugBlocking ?? ''}
          exclusive
          aria-label={t('blockingLabel')}
          onChange={(_, next: string | null) =>
            patch({ bugBlocking: (next ?? '') as ContactFormValues['bugBlocking'] })
          }
          sx={pillToggleStyle}
        >
          {BUG_BLOCKING_OPTIONS.map((option) => (
            <ToggleButton key={option} value={option} disableRipple>
              {t(`blockingOptions.${option}`)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {!showMore && (
        <Link
          component="button"
          type="button"
          variant="body2"
          onClick={() => setShowMore(true)}
          sx={{ display: 'inline-block', mb: 3 }}
        >
          + {t('moreToggle')}
        </Link>
      )}
      <Collapse in={showMore} unmountOnExit>
        <LabelledField id="contactExpected" label={t('expectedLabel')} optional>
          <SanitizedTextField
            {...contactTextFieldProps}
            id="contactExpected"
            value={values.bugExpected ?? ''}
            onChange={(v) => patch({ bugExpected: v })}
            multiline
            minRows={2}
          />
        </LabelledField>
        <LabelledField id="contactSecondary" label={t('stepsLabel')} optional>
          <SanitizedTextField
            {...contactTextFieldProps}
            id="contactSecondary"
            placeholder={t('stepsPlaceholder')}
            value={values.bugContext ?? ''}
            onChange={(v) => patch({ bugContext: v })}
            multiline
            minRows={3}
          />
        </LabelledField>
      </Collapse>
    </>
  );
};

export const FeedbackFields = ({
  values,
  patch,
  onSwitchToBug,
}: FieldSetProps & { onSwitchToBug: () => void }) => {
  const t = useTranslations('Contact.feedback');
  const selected = values.feedbackTags ?? [];

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography component="div" sx={groupLabelStyle}>
          {t('tagsLabel')}
        </Typography>
        <ToggleButtonGroup
          value={selected}
          onChange={(_, next: FeedbackTag[]) => patch({ feedbackTags: next })}
          aria-label={t('tagsLabel')}
          sx={pillToggleStyle}
        >
          {FEEDBACK_TAGS.map((tag) => (
            <ToggleButton key={tag} value={tag} disableRipple>
              {t(`tags.${tag}`)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {selected.includes('something_broke') && (
        <Typography component="div" variant="body2" sx={{ mb: 2, color: 'grey.800' }}>
          {t.rich('brokeNudge', {
            link: (chunks) => (
              <Link component="button" type="button" variant="body2" onClick={onSwitchToBug}>
                {chunks}
              </Link>
            ),
          })}
        </Typography>
      )}

      <LabelledField id="contactMessage" label={t('commentLabel')} optional>
        <SanitizedTextField
          {...contactTextFieldProps}
          id="contactMessage"
          placeholder={t('commentPlaceholder')}
          value={values.message}
          onChange={(v) => patch({ message: v })}
          multiline
          minRows={4}
        />
      </LabelledField>
    </>
  );
};

export const ContactFields = ({ values, patch }: FieldSetProps) => {
  const t = useTranslations('Contact.contact');

  return (
    <>
      <LabelledField id="contactReason" label={t('reasonLabel')} optional>
        <SanitizedTextField
          {...contactTextFieldProps}
          id="contactReason"
          select
          value={values.contactReason ?? ''}
          onChange={(v) => patch({ contactReason: v as ContactFormValues['contactReason'] })}
          slotProps={{ input: { disableUnderline: true }, select: { displayEmpty: true } }}
        >
          <MenuItem value="">
            <Box component="span" sx={{ color: 'grey.600' }}>
              {t('reasonPlaceholder')}
            </Box>
          </MenuItem>
          {CONTACT_REASONS.map((reason) => (
            <MenuItem key={reason} value={reason}>
              {t(`reasons.${reason}`)}
            </MenuItem>
          ))}
        </SanitizedTextField>
      </LabelledField>

      <LabelledField id="contactMessage" label={t('messageLabel')}>
        <SanitizedTextField
          {...contactTextFieldProps}
          id="contactMessage"
          placeholder={t('messagePlaceholder')}
          value={values.message}
          onChange={(v) => patch({ message: v })}
          required
          multiline
          minRows={4}
        />
      </LabelledField>
    </>
  );
};
