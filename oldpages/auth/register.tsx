import {
  Box,
  Card,
  CardContent,
  Container,
  Link,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { NextPage } from 'next';
import { GetStaticPropsContext } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import RegisterForm, { PartnerRegisterForm } from '../../components/forms/RegisterForm';
import PartnerHeader from '../../components/layout/PartnerHeader';
import { generatePartnershipPromoLogoClick } from '../../constants/events';
import { PartnerContent, getAllPartnersContent, getPartnerContent } from '../../constants/partners';
import { useAppDispatch, useTypedSelector } from '../../hooks/store';
import { Link as i18nLink, useRouter } from '../../i18n/routing';
import illustrationBloomHeadYellow from '../../public/illustration_bloom_head_yellow.svg';
import illustrationLeafMixDots from '../../public/illustration_leaf_mix_dots.svg';
import welcomeToBloom from '../../public/welcome_to_bloom.svg';
import { rowStyle } from '../../styles/common';
import { getImageSizes } from '../../utils/imageSizes';
import logEvent from '../../utils/logEvent';

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
  const searchParams = useSearchParams();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const entryPartnerAccessCode = useTypedSelector((state) => state.user.entryPartnerAccessCode);
  const entryPartnerReferral = useTypedSelector((state) => state.user.entryPartnerReferral);

  const [codeParam, setCodeParam] = useState<string>('');
  const [partnerContent, setPartnerContent] = useState<PartnerContent | null>(null);
  const [allPartnersContent, setAllPartnersContent] = useState<PartnerContent[]>([]);

  // Ensure partner access codes are stored in state and url query, to handle app refreshes and redirects
  useEffect(() => {
    const code = searchParams.get('code');
    const partner = searchParams.get('partner');

    if (partner) {
      const partnerContentResult = getPartnerContent(partner + '');
      if (partnerContentResult) {
        setPartnerContent(partnerContentResult);

        if (code) {
          // code in url query
          setCodeParam(code + '');
        } else if (
          entryPartnerReferral === partnerContentResult.name.toLowerCase() &&
          entryPartnerAccessCode
        ) {
          // Entry code in state, add to url query in case of refresh
          router.replace({
            pathname: '/auth/register',
            query: { partner: partner, code: entryPartnerAccessCode },
          });
          setCodeParam(entryPartnerAccessCode);
        }
      }
    } else {
      setAllPartnersContent(getAllPartnersContent());
    }
  }, [router, dispatch, entryPartnerAccessCode, entryPartnerReferral]);

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
          <Image
            alt={tS('alt.leafMixDots')}
            src={illustrationLeafMixDots}
            fill
            sizes={getImageSizes(imageContainerStyle.width)}
          />
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
                      component={i18nLink}
                      sx={logoContainerStyle}
                      key={`${partner.name}-link`}
                      aria-label={tS(partner.logoAlt)}
                      mt="1rem !important"
                      onClick={() => logEvent(generatePartnershipPromoLogoClick(partner.name))}
                      href={`/welcome/${partner.name.toLowerCase()}${
                        codeParam && '?code=' + codeParam
                      }`}
                    >
                      <Image
                        alt={tS(partner.logoAlt)}
                        src={partner.logo}
                        fill
                        sizes={getImageSizes(logoContainerStyle.maxWidth)}
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
        <title>{`${t('register.title')} • Bloom`}</title>
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
                    <Link
                      component={i18nLink}
                      href="https://chayn.notion.site/Public-0bd70701308549518d0c7c72fdd6c9b1"
                    >
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
