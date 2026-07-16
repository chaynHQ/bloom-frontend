import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { Dispatch, SetStateAction } from 'react';

import { LENGTH_KEYS, toggle, type Format, type LengthBucket } from '@/lib/utils/libraryData';
import { CheckRow } from './CheckRow';
import { FilterGroup } from './FilterGroup';

// The "Content type" + "Length" checkbox groups. Extracted so the sidebar can render them once for
// desktop (always visible) and once inside a mobile Collapse without duplicating markup.
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
  // True while "Courses" is selected: neither group describes a course, so both are inert.
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
