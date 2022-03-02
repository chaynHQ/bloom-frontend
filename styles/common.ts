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

export const centeredContainerStyle = {
  display: 'flex',
  height: '100vh',
  justifyContent: 'center',
  alignItems: 'center',
} as const;
