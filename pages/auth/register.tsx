import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { NextPage } from 'next';
import { GetStaticPropsContext } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Image from 'next/image';
import Link from '../../components/Link';
import PartnerHeader from '../../components/PartnerHeader';
import RegisterForm from '../../components/RegisterForm';
import bloomBumbleLogo from '../../public/bloom_bumble_logo.svg';
import illustrationBeehive from '../../public/illustration_beehive.svg';
import illustrationBloomHeadYellow from '../../public/illustration_bloom_head_yellow.svg';
import { rowStyle } from '../../styles/common';

const Register: NextPage = () => {
  const t = useTranslations('Auth');
  const tS = useTranslations('Shared');
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

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

  const extraContentStyle = {
    display: { xs: 'flex', md: 'block' },
    flexDirection: 'column',
    alignItems: 'center',
  } as const;

  const imageContainerStyle = {
    position: 'relative',
    width: { xs: 175, md: 250 },
    height: { xs: 140, md: 200 },
    marginTop: { xs: 4, md: 8 },
  } as const;

  const formCardStyle = {
    width: { xs: '100%', md: '45%' },
  } as const;

  const ExtraContent = () => {
    return (
      <Box sx={extraContentStyle}>
        <Link href="/welcome">{t.rich('bloomBumbleLink')}</Link>
        <Typography pt={2} variant="body1" component="p">
          {t.rich('loginLink', {
            loginLink: (children) => <Link href="/auth/login">{children}</Link>,
          })}
        </Typography>
        <Box sx={imageContainerStyle}>
          <Image alt={tS.raw('alt.beehive')} src={illustrationBeehive} />
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Head>
        <title>{t('register.title')}</title>
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
          {!isSmallScreen && <ExtraContent />}
        </Box>
        <Card sx={formCardStyle}>
          <CardContent>
            <Typography variant="h2" component="h2">
              {t.rich('register.title')}
            </Typography>
            <Typography variant="body1" component="p">
              {t.rich('register.description')}
            </Typography>

            <RegisterForm />

            <Typography variant="body2" component="p" textAlign="center">
              {t.rich('terms', {
                policiesLink: (children) => (
                  <Link href="https://chayn.notion.site/Privacy-policy-ad4a447bc1aa4d7294d9af5f8be7ae43">
                    {children}
                  </Link>
                ),
              })}
            </Typography>
          </CardContent>
        </Card>
      </Container>
      {isSmallScreen && (
        <Container>
          <ExtraContent />
        </Container>
      )}
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

export default Register;
