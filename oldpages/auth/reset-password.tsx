import { useRouter } from '@/18n/routing';
import { EmailForm, PasswordForm } from '@/components/forms/ResetPasswordForm';
import PartnerHeader from '@/omponents/layout/PartnerHeader';
import { rowStyle } from '@/tyles/common';
import illustrationBloomHeadYellow from '@/ublic/illustration_bloom_head_yellow.svg';
import welcomeToBloom from '@/ublic/welcome_to_bloom.svg';
import { Box, Card, CardContent, Container, Typography } from '@mui/material';
import type { NextPage } from 'next';
import { GetStaticPropsContext } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useSearchParams } from 'next/navigation';

const containerStyle = {
  ...rowStyle,
  backgroundColor: 'primary.light',
} as const;

const textContainerStyle = {
  maxWidth: 600,
  width: { xs: '100%', md: '45%' },
} as const;

const formCardStyle = {
  width: { xs: '100%', sm: '70%', md: '45%' },
} as const;

const ResetPassword: NextPage = () => {
  const t = useTranslations('Auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCodeParam = searchParams.get('oobCode');

  const headerProps = {
    partnerLogoSrc: welcomeToBloom,
    partnerLogoAlt: 'alt.welcomeToBloom',
    imageSrc: illustrationBloomHeadYellow,
    imageAlt: 'alt.bloomHead',
  };

  return (
    <Box>
      <Head>
        <title>{`${t('resetPassword.title')} • Bloom`}</title>
      </Head>
      <PartnerHeader
        partnerLogoSrc={headerProps.partnerLogoSrc}
        partnerLogoAlt={headerProps.partnerLogoAlt}
        imageSrc={headerProps.imageSrc}
        imageAlt={headerProps.imageAlt}
      />
      <Container sx={containerStyle}>
        <Box sx={textContainerStyle}>
          <Typography pb={2} variant="subtitle1" component="p">
            {t('introduction')}
          </Typography>
        </Box>
        <Card sx={formCardStyle}>
          <CardContent>
            <Typography variant="h2" component="h2">
              {t('resetPassword.title')}
            </Typography>
            {oobCodeParam ? <PasswordForm codeParam={oobCodeParam} /> : <EmailForm />}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: {
        ...require(`../../messages/shared/${locale}.json`),
        ...require(`../../messages/navigation/${locale}.json`),
        ...require(`../../messages/auth/${locale}.json`),
      },
    },
  };
}

export default ResetPassword;
