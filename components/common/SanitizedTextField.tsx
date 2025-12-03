'use client';

import { Box, TextField, TextFieldProps, Typography } from '@mui/material';
import DOMPurify from 'dompurify';
import { useCallback } from 'react';

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

interface SanitizedTextFieldProps
  extends Omit<TextFieldProps, 'onChange' | 'inputProps' | 'value' | 'defaultValue'> {
  onChange?: (value: string) => void;
  allowedTags?: string[];
  allowedAttributes?: string[];
  maxLength?: number; // Manual override
  showCharacterCount?: boolean; // Optional character counter
  inputProps?: TextFieldProps['inputProps'];
  value?: string;
  defaultValue?: string;
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
  // Determine max length based on field ID or manual override
  const getMaxLength = useCallback(() => {
    if (maxLength) return maxLength;
    if (id && id in FIELD_VALIDATION_RULES) {
      return FIELD_VALIDATION_RULES[id as keyof typeof FIELD_VALIDATION_RULES].maxLength;
    }
    return FIELD_VALIDATION_RULES.default.maxLength;
  }, [maxLength, id]);

  const fieldMaxLength = getMaxLength();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let inputValue = e.target.value;

      // Apply length validation (truncate if too long)
      if (inputValue.length > fieldMaxLength) {
        inputValue = inputValue.substring(0, fieldMaxLength);
      }

      // Apply sanitization
      const sanitized = DOMPurify.sanitize(inputValue, {
        ALLOWED_TAGS: allowedTags,
        ALLOWED_ATTR: allowedAttributes,
        KEEP_CONTENT: false,
      });

      onChange?.(sanitized.toString());
    },
    [onChange, allowedTags, allowedAttributes, fieldMaxLength],
  );

  // Determine which value to use for character counting
  const effectiveValue = value !== undefined ? value : defaultValue || '';
  const currentLength = effectiveValue.toString().length || 0;
  const shouldShowCounter =
    showCharacterCount || (restProps.multiline && currentLength > fieldMaxLength * 0.8);

  // Build the props object for TextField
  const textFieldProps: any = {
    ...restProps,
    id,
    onChange: handleChange,
    inputProps: { maxLength: fieldMaxLength, ...inputProps },
  };

  // Only pass value OR defaultValue, not both
  if (value !== undefined) {
    textFieldProps.value = value;
  } else if (defaultValue !== undefined) {
    textFieldProps.defaultValue = defaultValue;
  }

  return (
    <Box>
      <TextField {...textFieldProps} />
      {shouldShowCounter && (
        <Typography
          variant="caption"
          color={currentLength > fieldMaxLength ? 'error' : 'textSecondary'}
          sx={{ fontSize: '0.75rem', mt: 0.5, display: 'block' }}
        >
          {currentLength}/{fieldMaxLength} characters
        </Typography>
      )}
    </Box>
  );
};

export default SanitizedTextField;
