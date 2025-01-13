import { GetStaticPropsContext, NextPage } from 'next';

import { Box, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import illustrationChange from '../public/illustration_change_peach.svg';
import { getImageSizes } from '../utils/imageSizes';

const containerStyle = {
  textAlign: 'center',
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 120, md: 160 },
  height: { xs: 120, md: 160 },
  marginBottom: 4,
  marginX: 'auto',
} as const;

const Maintenance: NextPage = () => {
  const t = useTranslations('Shared');

  return (
    <Container sx={containerStyle}>
      <Box sx={imageContainerStyle}>
        <Image
          alt={t('alt.change')}
          src={illustrationChange}
          fill
          sizes={getImageSizes(imageContainerStyle.width)}
          style={{
            objectFit: 'contain',
          }}
        />
      </Box>
      <Typography variant="h2" component="h2" mb={2}>
        {t('maintenanceBanner.title')}
      </Typography>
      <Typography maxWidth={650} mb={2} mx={'auto'}>
        {t('maintenanceBanner.description', { hours: process.env.NEXT_PUBLIC_MAINTENANCE_HOURS })}
      </Typography>
    </Container>
  );
};

export async function getStaticProps({ locale, preview = false }: GetStaticPropsContext) {
  return {
    props: {
      messages: {
        ...require(`../messages/shared/${locale}.json`),
        ...require(`../messages/navigation/${locale}.json`),
      },
    },
    revalidate: 3600, // revalidate every hour
  };
}

export default Maintenance;
