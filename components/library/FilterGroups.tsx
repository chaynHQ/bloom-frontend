import { LENGTH_KEYS, toggle, type Format, type LengthBucket } from '@/lib/utils/libraryData';
import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

const groupStyle = { mb: 4, '&:last-of-type': { mb: 0 } } as const;

const groupTitleStyle = { fontWeight: 600, fontSize: '0.875rem' } as const;

// The global MuiFormControlLabel override in styles/theme.ts reaches the checkbox with a
// `& .MuiCheckbox-root` selector, which out-specifies an `sx` on the Checkbox itself.
const checkRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  m: 0,
  py: 1,
  borderBottom: '1px solid',
  borderColor: 'cardBorder',
  '& .MuiCheckbox-root': {
    p: 1.5,
    m: 0,
    alignSelf: 'center',
    color: 'grey.600',
    '&.Mui-checked': { color: 'primary.dark' },
    '&.Mui-disabled': { color: 'grey.400' },
  },
} as const;

// A titled group of filter rows.
function FilterGroup({
  title,
  disabled,
  children,
}: {
  title: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Box sx={groupStyle}>
      <Typography sx={{ ...groupTitleStyle, color: disabled ? 'grey.500' : 'grey.800' }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <FormControlLabel
      labelPlacement="start"
      disabled={disabled}
      control={<Checkbox checked={checked} onChange={onChange} disableRipple />}
      label={<Typography sx={{ color: disabled ? 'grey.500' : 'grey.700' }}>{label}</Typography>}
      sx={checkRowStyle}
    />
  );
}

// The "Content type" and "Length" checkbox groups.
export function FilterGroups({
  formatOptions,
  formats,
  setFormats,
  lengths,
  setLengths,
  disabled,
}: {
  formatOptions: Format[];
  formats: Format[];
  setFormats: Dispatch<SetStateAction<Format[]>>;
  lengths: LengthBucket[];
  setLengths: Dispatch<SetStateAction<LengthBucket[]>>;
  // True while "Courses" is selected.
  disabled: boolean;
}) {
  const t = useTranslations('Library');
  return (
    <Box sx={{ pt: 4 }}>
      {formatOptions.length > 0 && (
        <FilterGroup title={t('contentTypeHeading')} disabled={disabled}>
          {formatOptions.map((option) => (
            <CheckRow
              key={option}
              label={t(`contentTypes.${option}`)}
              checked={formats.includes(option)}
              onChange={() => setFormats((p) => toggle(p, option))}
              disabled={disabled}
            />
          ))}
        </FilterGroup>
      )}

      <FilterGroup title={t('lengthHeading')} disabled={disabled}>
        {LENGTH_KEYS.map((length) => (
          <CheckRow
            key={length}
            label={t(`lengths.${length}`)}
            checked={lengths.includes(length)}
            onChange={() => setLengths((p) => toggle(p, length))}
            disabled={disabled}
          />
        ))}
      </FilterGroup>
    </Box>
  );
}
