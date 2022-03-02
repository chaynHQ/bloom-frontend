import { Container, Typography } from '@mui/material';
import { Box } from '@mui/system';
import Head from 'next/head';
import Image from 'next/image';
import { useTranslations } from 'use-intl';
import { RootState } from '../app/store';
import Link from '../components/Link';
import { useTypedSelector } from '../hooks/store';
import illustrationPerson4Peach from '../public/illustration_person4_peach.svg';

export function PartnerAdminGuard({ children }: { children: JSX.Element }) {
  const { partnerAdmin } = useTypedSelector((state: RootState) => state);
  const t = useTranslations('PartnerAdmin.accessGuard');
  const tS = useTranslations('Shared');

  if (!partnerAdmin) {
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
            src={illustrationPerson4Peach}
            layout="fill"
            objectFit="contain"
          />
        </Box>
        <Typography variant="h2" component="h2" mb={2}>
          {t('title')}
        </Typography>
        <Typography mb={2}>
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
