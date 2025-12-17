import { getIsMaintenanceMode } from '@/lib/utils/maintenanceMode';

export const rowStyle = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
} as const;

export const columnStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
} as const;

export const iconTextRowStyle = {
  ...rowStyle,
  gap: 1.5,
  marginTop: 2,
  alignItems: 'center',
  justifyContent: 'flex-start',
} as const;

export const richtextContentStyle = {
  '&:only-child': {
    marginY: 0,
  },

  '&:first-of-type': {
    marginTop: 0,
  },

  '&:last-of-type': {
    marginBottom: 0,
  },
} as const;

export const breadcrumbButtonStyle = {
  backgroundColor: 'white',
  ':hover': {
    background: 'white',
  },
  position: 'fixed',
  px: 2,
  left: { xs: 16, lg: '8%' },
  top: { xs: 68, sm: 80, md: 160 },
  zIndex: 100,
  boxShadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.12);',
} as const;

export const scaleTitleStyle = {
  marginBottom: '0.5rem !important',
  fontStyle: 'italic',
  color: 'grey.800',
};

export const staticFieldLabelStyle = {
  marginBottom: 4,

  '> .MuiInputLabel-shrink': {
    position: 'relative',
    transform: 'none !important',
    whiteSpace: 'initial',

    '&.Mui-focused': {
      transform: 'none !important',
    },
  },

  '> .MuiInput-root': {
    marginTop: 1,
  },
};

export const topBarSpacerStyle = {
  height: { xs: '3rem', sm: '4rem', md: getIsMaintenanceMode() ? '4rem' : '8rem' },
} as const;

export const mobileBottomNavSpacerStyle = {
  height: { xs: 9, md: 0 }, // Approximately 72px in MUI spacing units
} as const;

export const fullScreenContainerStyle = {
  ...columnStyle,
  minHeight: {
    xs: `calc(100vh - ${topBarSpacerStyle.height.xs})`,
    md: `calc(100vh - ${topBarSpacerStyle.height.md})`,
  },
  backgroundColor: 'background.default',
} as const;
