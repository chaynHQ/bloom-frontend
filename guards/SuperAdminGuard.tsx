import { Box, Container, Link, Typography } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useTranslations } from 'use-intl';
import { useTypedSelector } from '../hooks/store';
import illustrationPerson4Peach from '../public/illustration_person4_peach.svg';
import { columnStyle } from '../styles/common';
import { getImageSizes } from '../utils/imageSizes';

const containerStyle = {
  ...columnStyle,
  height: '100vh',
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 150, md: 210 },
  height: { xs: 150, md: 210 },
  marginBottom: 4,
} as const;

export function SuperAdminGuard({ children }: { children: JSX.Element }) {
  const userIsSuperAdmin = useTypedSelector((state) => state.user.isSuperAdmin);
  const t = useTranslations('Admin.accessGuard');
  const tS = useTranslations('Shared');

  if (!userIsSuperAdmin) {
    return (
      <Container sx={containerStyle}>
        <Head>
          <title>{`${t('title')} • Bloom`}</title>
        </Head>
        <Box sx={imageContainerStyle}>
          <Image
            alt={tS('alt.personTea')}
            src={illustrationPerson4Peach}
            fill
            sizes={getImageSizes(imageContainerStyle.width)}
            style={{
              objectFit: 'contain',
            }}
          />
        </Box>
        <Typography variant="h2" component="h2" mb={2}>
          {t('title')}
        </Typography>
        <Typography mb={2}>
          {t.rich('introduction', {
            contactLink: (children) => <Link href={tS('feedbackTypeform')}>{children}</Link>,
          })}
        </Typography>
      </Container>
    );
  }

  return <>{children}</>;
}
