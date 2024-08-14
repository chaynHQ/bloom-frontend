// THIS COLOUR IS USED FOR PWA META TAG CONFIGURATION IN A SERVER COMPONENT
export const COLOUR_PRIMARY_MAIN = '#F3D6D8';

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
