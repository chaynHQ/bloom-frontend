import 'react-international-phone/style.css';

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

const inputStyles = { width: '15rem', '.MuiInput-root': { mt: 2.5 } } as const;

const selectStyles = {
  width: 'max-content',
  // Remove default outline
  fieldset: {
    display: 'none',
  },
  '.MuiSelect-select': {
    padding: '8px',
    paddingRight: '24px !important',
  },
  svg: {
    right: 0,
  },
} as const;

const menuProps = {
  style: {
    height: '20rem',
    width: '30rem',
    top: '0.5rem',
    left: '-1.75rem',
  },
  transformOrigin: {
    vertical: 'top',
    horizontal: 'left',
  },
} as const;

interface PhoneInputProps extends BaseTextFieldProps {
  value: string;
  onChange: (phone: string) => void;
}

const PhoneInput = (props: PhoneInputProps) => {
  const { value, onChange, ...restProps } = props;

  // Note this component is only used on the whatsapp form currently
  // Phone number validation is not included in this component, see whatsapp example
  // Follows example https://github.com/goveo/react-international-phone/blob/master/src/stories/UiLibsExample/components/MuiPhone.tsx
  const t = useTranslations('Whatsapp.form');

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
      InputProps={{
        startAdornment: (
          <InputAdornment position="start" style={{ marginRight: '2px', marginLeft: '-8px' }}>
            <Select
              MenuProps={menuProps}
              sx={selectStyles}
              value={country.iso2}
              onChange={(e) => setCountry(e.target.value as CountryIso2)}
              renderValue={(value) => <FlagImage iso2={value} style={{ display: 'flex' }} />}
            >
              {defaultCountries.map((c) => {
                const country = parseCountry(c);

                return (
                  <MenuItem key={country.iso2} value={country.iso2}>
                    <FlagImage iso2={country.iso2} style={{ marginRight: '8px' }} />
                    <Typography marginRight="8px">{country.name}</Typography>
                    <Typography color="gray">+{country.dialCode}</Typography>
                  </MenuItem>
                );
              })}
            </Select>
          </InputAdornment>
        ),
      }}
      {...restProps}
    />
  );
};

export default PhoneInput;
