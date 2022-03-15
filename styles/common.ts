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

export const richtextContentStyle = {
  '&:only-child': {
    marginY: 0,
  },

  '&:first-child': {
    marginTop: 0,
  },

  '&:last-child': {
    marginBottom: 0,
  },
} as const;
