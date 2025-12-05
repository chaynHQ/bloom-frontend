'use client';

import { Box, TextField, TextFieldProps, Typography } from '@mui/material';
import DOMPurify from 'dompurify';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

// Field validation rules based on backend DTOs
const FIELD_VALIDATION_RULES = {
  name: { maxLength: 50 },
  email: { maxLength: 255 },
  password: { maxLength: 128 },
  partnerAccessCode: { maxLength: 6 },
  mfaVerificationCode: { maxLength: 6 },
  accessCode: { maxLength: 6 },
  partnerId: { maxLength: 36 },
  signUpLanguage: { maxLength: 10 },
  feedbackDescription: { maxLength: 5000 },
  hopes: { maxLength: 5000 },
  raceEthnNatn: { maxLength: 500 },
  resourceId: { maxLength: 36 },
  sessionId: { maxLength: 36 },
  default: { maxLength: 500 },
} as const;

interface SanitizedTextFieldProps extends Omit<
  TextFieldProps,
  'onChange' | 'inputProps' | 'value' | 'defaultValue'
> {
  onChange?: (value: string) => void;
  allowedTags?: string[];
  allowedAttributes?: string[];
  maxLength?: number;
  showCharacterCount?: boolean;
  inputProps?: TextFieldProps['inputProps'];
  value?: string | null;
  defaultValue?: string | null;
}

const SanitizedTextField = ({
  onChange,
  allowedTags = [],
  allowedAttributes = [],
  maxLength,
  showCharacterCount = false,
  id,
  value,
  defaultValue,
  inputProps,
  ...restProps
}: SanitizedTextFieldProps) => {
  const t = useTranslations('Shared');
  const fieldMaxLength = useMemo(() => {
    if (maxLength) return maxLength;
    if (id && id in FIELD_VALIDATION_RULES) {
      return FIELD_VALIDATION_RULES[id as keyof typeof FIELD_VALIDATION_RULES].maxLength;
    }
    return FIELD_VALIDATION_RULES.default.maxLength;
  }, [maxLength, id]);

  const purifyConfig = useMemo(
    () => ({
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttributes,
      KEEP_CONTENT: false,
    }),
    [allowedTags, allowedAttributes],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const inputValue =
      e.target.value.length > fieldMaxLength
        ? e.target.value.substring(0, fieldMaxLength)
        : e.target.value;

    const sanitized = DOMPurify.sanitize(inputValue, purifyConfig);
    onChange?.(sanitized);
  };

  const effectiveValue = value ?? defaultValue ?? '';
  const currentLength = effectiveValue.toString().length;
  const shouldShowCounter =
    showCharacterCount || (restProps.multiline && currentLength > fieldMaxLength * 0.8);

  const textFieldProps = {
    ...restProps,
    id,
    onChange: handleChange,
    inputProps: { maxLength: fieldMaxLength, ...inputProps },
    ...(value !== undefined ? { value } : { defaultValue }),
  };

  const characterCountStyle = {
    display: 'block',
    textAlign: 'right',
    mt: -2.475,
    ...(currentLength > fieldMaxLength && { color: 'error.main' }),
  };

  return (
    <Box mb={0}>
      <TextField {...textFieldProps} />
      {shouldShowCounter && (
        <Typography variant="caption" sx={characterCountStyle}>
          {t('characterCount', { current: currentLength, max: fieldMaxLength })}
        </Typography>
      )}
    </Box>
  );
};

export default SanitizedTextField;
