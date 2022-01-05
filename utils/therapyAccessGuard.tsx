import { Container, Typography } from '@mui/material';
import { Box } from '@mui/system';
import Head from 'next/head';
import Image from 'next/image';
import { useTranslations } from 'use-intl';
import { RootState } from '../app/store';
import Link from '../components/Link';
import { useTypedSelector } from '../hooks/store';
import illustrationTeaPeach from '../public/illustration_tea_peach.png';

export function TherapyAccessGuard({ children }: { children: JSX.Element }) {
  const { partnerAccess } = useTypedSelector((state: RootState) => state);
  const t = useTranslations('Therapy.accessGuard');
  const tS = useTranslations('Shared');

  if (!partnerAccess) {
    const imageContainerStyle = {
      position: 'relative',
      width: { xs: 150, md: 210 },
      height: { xs: 150, md: 210 },
      marginBottom: 4,
    } as const;

    return (
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          justifyContent: 'center',
        }}
      >
        <Head>{t('title')}</Head>
        <Box sx={imageContainerStyle}>
          <Image
            alt={tS('alt.personTea')}
            src={illustrationTeaPeach}
            layout="fill"
            objectFit="contain"
          />
        </Box>
        <Typography variant="h2" component="h2" mb={2}>
          {t('title')}
        </Typography>
        <Typography variant="body1" component="p" mb={2}>
          {t.rich('introduction', {
            contactLink: (children) => (
              <Link href="https://chayn.typeform.com/to/OY9Wdk4h">{children}</Link>
            ),
          })}
        </Typography>
      </Container>
    );
  }

  return <>{children}</>;
}
