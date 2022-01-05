import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import type { NextPage } from 'next';
import { GetStaticPropsContext } from 'next';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import Link from '../../components/Link';
import PartnerHeader from '../../components/PartnerHeader';
import { EmailForm, PasswordForm } from '../../components/ResetPasswordForm';
import bloomBumbleLogo from '../../public/bloom_bumble_logo.svg';
import illustrationBloomHeadYellow from '../../public/illustration_bloom_head_yellow.svg';
import { rowStyle } from '../../styles/common';

const ResetPassword: NextPage = () => {
  const t = useTranslations('Auth');
  const router = useRouter();
  const codeParam: string | undefined = router.query.oobCode
    ? router.query.oobCode instanceof Array
      ? router.query.oobCode + ''
      : router.query.oobCode
    : undefined;

  const headerProps = {
    partnerLogoSrc: bloomBumbleLogo,
    partnerLogoAlt: 'alt.bloomBumbleLogo',
    imageSrc: illustrationBloomHeadYellow,
    imageAlt: 'alt.bloomLogo',
  };

  const containerStyle = {
    ...rowStyle,
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    backgroundColor: 'primary.light',
  } as const;

  const textContainerStyle = {
    maxWidth: 600,
    width: { xs: '100%', md: '45%' },
  } as const;

  const formCardStyle = {
    width: { xs: '100%', md: '45%' },
  } as const;

  return (
    <Box>
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
          <Link href="/welcome">{t.rich('bloomBumbleLink')}</Link>
        </Box>
        <Card sx={formCardStyle}>
          <CardContent>
            <Typography variant="h2" component="h2">
              {t.rich('resetPassword.title')}
            </Typography>
            {codeParam ? <PasswordForm codeParam={codeParam} /> : <EmailForm />}
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
