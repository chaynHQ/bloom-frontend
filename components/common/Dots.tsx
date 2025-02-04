'use client';

import { columnStyle } from '@/styles/common';
import CircleIcon from '@mui/icons-material/Circle';
import Box from '@mui/material/Box';

const dotsStyle = {
  ...columnStyle,
  color: 'primary.dark',
  gap: { xs: 1, md: 1.25 },
} as const;

const dotStyle = {
  width: { xs: 8, md: 10 },
  height: { xs: 8, md: 10 },
} as const;

export const Dots = () => {
  return (
    <Box sx={dotsStyle}>
      <CircleIcon sx={dotStyle} />
      <CircleIcon sx={dotStyle} />
    </Box>
  );
};
