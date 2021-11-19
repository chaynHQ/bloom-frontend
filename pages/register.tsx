import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { NextPage } from 'next';
import { GetStaticPropsContext } from 'next';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from '../components/Link';
import PartnerHeader from '../components/PartnerHeader';
// import Image from 'next/image';
import bloomBumbleLogo from '../public/bloom_bumble_logo.svg';
import illustrationBeehive from '../public/illustration_beehive.svg';
import illustrationBloomHeadYellow from '../public/illustration_bloom_head_yellow.svg';
import { rowStyle } from '../styles/common';
const Register: NextPage = () => {
  const t = useTranslations('Register');
  const tShared = useTranslations('Shared');
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const headerProps = {
    partnerLogoSrc: bloomBumbleLogo,
    partnerLogoAlt: tShared.raw('bloomBumbleLogo'),
    imageSrc: illustrationBloomHeadYellow,
    imageAlt: tShared.raw('bloomLogo'),
  };

  const containerStyle = {
    ...rowStyle,
    justifyContent: 'space-between',
    backgroundColor: 'primary.light',
  } as const;

  const textContainerStyle = {
    maxWidth: 600,
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

  const ExtraContent = () => {
    return (
      <Box sx={extraContentStyle}>
        <Link href="/welcome">{t.rich('bloomBumbleLink')}</Link>
        <Box sx={imageContainerStyle}>
          <Image alt={tShared.raw('alt.beehive')} src={illustrationBeehive} />
        </Box>
      </Box>
    );
  };

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
          {!isSmallScreen && <ExtraContent />}
        </Box>
        <Box></Box>
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
        ...require(`../messages/shared/${locale}.json`),
        ...require(`../messages/navigation/${locale}.json`),
        ...require(`../messages/register/${locale}.json`),
      },
    },
  };
}

export default Register;
