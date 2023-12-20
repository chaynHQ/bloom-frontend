import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

const NoDataAvailable = () => {
  const t = useTranslations('Shared.noDataAvailable');

  return (
    <Box m={10}>
      <Typography>{t('title')}</Typography>
    </Box>
  );
};

export default NoDataAvailable;
