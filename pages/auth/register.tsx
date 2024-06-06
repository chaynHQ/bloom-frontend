import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { NextPage } from 'next';
import { GetStaticPropsContext } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from '../../components/common/Link';
import RegisterForm, { PartnerRegisterForm } from '../../components/forms/RegisterForm';
import PartnerHeader from '../../components/layout/PartnerHeader';
import { generatePartnershipPromoLogoClick } from '../../constants/events';
import { PartnerContent, getAllPartnersContent, getPartnerContent } from '../../constants/partners';
import { useTypedSelector } from '../../hooks/store';
import illustrationBloomHeadYellow from '../../public/illustration_bloom_head_yellow.svg';
import illustrationLeafMixDots from '../../public/illustration_leaf_mix_dots.svg';
import welcomeToBloom from '../../public/welcome_to_bloom.svg';
import { rowStyle } from '../../styles/common';
import logEvent, { getEventUserData } from '../../utils/logEvent';

const containerStyle = {
  ...rowStyle,
  backgroundColor: 'primary.light',
} as const;

const textContainerStyle = {
  maxWidth: 600,
  width: { xs: '100%', md: '45%' },
} as const;

const cardContainerStyle = {
  width: { xs: '100%', sm: '70%', md: '45%' },
  alignSelf: 'flex-start',
} as const;

const publicCardStyle = {
  width: { xs: '100%', sm: 'auto' },
  alignSelf: 'flex-start',
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 140, md: 160 },
  height: { xs: 80, md: 80 },
  marginBottom: 3,
  marginTop: { xs: 0, md: 2 },
} as const;

const logoContainerStyle = {
  display: 'block',
  position: 'relative',
  flex: 1,
  height: 48,
  maxWidth: 165,
} as const;

const logosContainerStyle = {
  ...rowStyle,
  gap: 4,
  justifyContent: 'flex-start',
} as const;

const Register: NextPage = () => {
  const t = useTranslations('Auth');
  const tS = useTranslations('Shared');
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  const [codeParam, setCodeParam] = useState<string>('');
  const [partnerContent, setPartnerContent] = useState<PartnerContent | null>(null);
  const [allPartnersContent, setAllPartnersContent] = useState<PartnerContent[]>([]);

  useEffect(() => {
    const { code, partner } = router.query;

    if (code) setCodeParam(code + '');

    if (partner) {
      const partnerContentResult = getPartnerContent(partner + '');
      if (partnerContentResult) setPartnerContent(partnerContentResult);
    } else {
      setAllPartnersContent(getAllPartnersContent());
    }
  }, [router.query]);

  const headerProps = {
    partnerLogoSrc: partnerContent?.partnershipLogo || welcomeToBloom,
    partnerLogoAlt: 'alt.welcomeToBloom',
    imageSrc: partnerContent?.bloomGirlIllustration || illustrationBloomHeadYellow,
    imageAlt: 'alt.bloomHead',
  };

  const ExtraContent = () => {
    return (
      <>
        <Box sx={imageContainerStyle}>
          <Image alt={tS('alt.leafMixDots')} src={illustrationLeafMixDots} fill sizes="100vw" />
        </Box>
        {!partnerContent && (
          // Show the public bloom and all other partner's welcome page links
          <>
            <Card sx={publicCardStyle}>
              <CardContent>
                <Typography variant="h3" component="h3">
                  {t('register.partnershipsTitle')}
                </Typography>
                <Typography>{t('register.partnershipsDescription')}</Typography>
                <Box sx={logosContainerStyle}>
                  {allPartnersContent?.map((partner) => (
                    <Link
                      sx={logoContainerStyle}
                      key={`${partner.name}-link`}
                      aria-label={tS(partner.logoAlt)}
                      mt="1rem !important"
                      onClick={() =>
                        logEvent(generatePartnershipPromoLogoClick(partner.name), eventUserData)
                      }
                      href={`/welcome/${partner.name.toLowerCase()}${
                        codeParam && '?code=' + codeParam
                      }`}
                    >
                      <Image
                        alt={tS(partner.logoAlt)}
                        src={partner.logo}
                        fill
                        sizes="100vw"
                        style={{
                          objectFit: 'contain',
                        }}
                      />
                    </Link>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </>
        )}
      </>
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
        <Box sx={cardContainerStyle}>
          <Card>
            <CardContent>
              <Typography variant="h2" component="h2">
                {t('register.title')}
              </Typography>

              {partnerContent ? (
                <PartnerRegisterForm partnerName={partnerContent.name} codeParam={codeParam} />
              ) : (
                <RegisterForm />
              )}

              <Typography variant="body2" component="p" textAlign="center">
                {t.rich('terms', {
                  policiesLink: (children) => (
                    <Link href="https://chayn.notion.site/Public-0bd70701308549518d0c7c72fdd6c9b1">
                      {children}
                    </Link>
                  ),
                })}
              </Typography>
            </CardContent>
          </Card>
        </Box>
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
