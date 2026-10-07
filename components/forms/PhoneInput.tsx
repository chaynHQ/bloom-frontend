'use client';

import { useIsRtl } from '@/lib/hooks/useIsRtl';
import {
  BaseTextFieldProps,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import {
  CountryIso2,
  FlagImage,
  defaultCountries,
  parseCountry,
  usePhoneInput,
} from 'react-international-phone';
import 'react-international-phone/style.css';

const inputStyles = {
  width: '100%',
  '.MuiInput-root': { mt: 2.5 },
  // Browsers force tel inputs to LTR; keep that for the digits but let the placeholder follow the page.
  '& input:placeholder-shown': { direction: 'inherit' },
} as const;

const selectStyles = {
  width: 'max-content',
  // Remove default outline
  fieldset: {
    display: 'none',
  },
  '.MuiSelect-select': {
    padding: '8px',
    paddingInlineEnd: '24px !important',
  },
  svg: {
    insetInlineEnd: 0,
  },
} as const;

// The menu opens from the select's centre towards the inline end. MUI doesn't mirror an explicit
// origin, so the side is picked per direction.
const menuProps = (isRtl: boolean) =>
  ({
    style: {
      height: '20rem',
      width: '30rem',
      top: '0.5rem',
      insetInlineStart: '-1.75rem',
    },
    transformOrigin: {
      vertical: 'top',
      horizontal: isRtl ? 'right' : 'left',
    },
  }) as const;

interface PhoneInputProps extends BaseTextFieldProps {
  value: string;
  onChange: (phone: string) => void;
}

const PhoneInput = (props: PhoneInputProps) => {
  const { value, onChange, ...restProps } = props;

  // Note this component is only used on the WhatsApp form currently
  // Phone number validation is not included in this component, see whatsapp example
  // Follows example https://github.com/goveo/react-international-phone/blob/master/src/stories/UiLibsExample/components/MuiPhone.tsx
  const t = useTranslations('Whatsapp.form');
  const isRtl = useIsRtl();

  const { inputValue, handlePhoneValueChange, inputRef, country, setCountry } = usePhoneInput({
    defaultCountry: 'gb',
    value,
    countries: defaultCountries,
    onChange: (data) => {
      onChange(data.phone);
    },
  });

  return (
    <TextField
      id="phoneNumber"
      name="phoneNumber"
      variant="standard"
      label={t('phoneNumber')}
      color="primary"
      sx={inputStyles}
      placeholder={t('phoneNumber')}
      value={inputValue}
      onChange={handlePhoneValueChange}
      type="tel"
      inputRef={inputRef}
      {...restProps}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment
              position="start"
              style={{ marginInlineEnd: '2px', marginInlineStart: '-8px' }}
            >
              <Select
                MenuProps={menuProps(isRtl)}
                sx={selectStyles}
                value={country.iso2}
                onChange={(e) => setCountry(e.target.value as CountryIso2)}
                renderValue={(value) => <FlagImage iso2={value} style={{ display: 'flex' }} />}
              >
                {defaultCountries.map((c) => {
                  const country = parseCountry(c);

                  return (
                    <MenuItem key={country.iso2} value={country.iso2}>
                      <FlagImage iso2={country.iso2} style={{ marginInlineEnd: '8px' }} />
                      <Typography
                        sx={{
                          marginInlineEnd: '8px',
                        }}
                      >
                        {country.name}
                      </Typography>
                      <Typography color="gray">+{country.dialCode}</Typography>
                    </MenuItem>
                  );
                })}
              </Select>
            </InputAdornment>
          ),
        },
        // Phone numbers (incl. the dial-code prefix) are always written left-to-right,
        // even on RTL pages — keep the number field LTR regardless of locale.
        htmlInput: { dir: 'ltr' },
      }}
    />
  );
};

export default PhoneInput;
