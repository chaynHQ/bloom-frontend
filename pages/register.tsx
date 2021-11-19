import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import type { NextPage } from 'next';
import { GetStaticPropsContext } from 'next';
import { useTranslations } from 'next-intl';
import PartnerHeader from '../components/PartnerHeader';
// import Image from 'next/image';
import bloomBumbleLogo from '../public/bloom_bumble_logo.svg';
import illustrationTeaPeach from '../public/illustration_tea_peach.png';
import { rowStyle } from '../styles/common';

const Register: NextPage = () => {
  const t = useTranslations('Register');
  const tShared = useTranslations('Shared');

  const headerProps = {
    partnerLogoSrc: bloomBumbleLogo,
    partnerLogoAlt: tShared.raw('bloomBumbleLogo'),
    imageSrc: illustrationTeaPeach,
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
          <Typography variant="subtitle1" component="p">
            {t('introduction')}
          </Typography>
        </Box>
        <Box></Box>
      </Container>
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
