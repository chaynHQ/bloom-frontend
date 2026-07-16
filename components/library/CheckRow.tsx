import { Checkbox, FormControlLabel, Typography } from '@mui/material';

import { CARD_BORDER } from './libraryTokens';

// The global MuiFormControlLabel override in styles/theme.ts styles the checkbox via a
// `& .MuiCheckbox-root` descendant selector, which out-specifies an `sx` on the Checkbox itself —
// so the row styling has to be applied from the FormControlLabel to land.
const CHECKBOX_SX = {
  '& .MuiCheckbox-root': {
    p: 1.5,
    m: 0,
    alignSelf: 'center',
    color: 'grey.600',
    '&.Mui-checked': { color: 'primary.dark' },
    '&.Mui-disabled': { color: 'grey.400' },
  },
} as const;

// A filter row: label on the leading edge, checkbox on the trailing edge, divider underneath.
export function CheckRow({
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
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        m: 0,
        py: 1,
        borderBottom: '1px solid',
        borderColor: CARD_BORDER,
        ...CHECKBOX_SX,
      }}
    />
  );
}
