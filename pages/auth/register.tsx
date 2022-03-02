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
import { useRouter } from 'next/router';
import * as React from 'react';
import { useEffect, useState } from 'react';
import Link from '../../components/Link';
import PartnerHeader from '../../components/PartnerHeader';
import RegisterForm from '../../components/RegisterForm';
import { getAllPartnersContent, getPartnerContent, Partner } from '../../constants/partners';
import illustrationBloomHeadYellow from '../../public/illustration_bloom_head_yellow.svg';
import illustrationLeafMix from '../../public/illustration_leaf_mix.svg';
import welcomeToBloom from '../../public/welcome_to_bloom.svg';
import { rowStyle } from '../../styles/common';

const Register: NextPage = () => {
  const t = useTranslations('Auth');
  const tS = useTranslations('Shared');
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [codeParam, setCodeParam] = useState<string>('');
  const [partnerContent, setPartnerContent] = useState<Partner | null>(null);
  const [allPartnersContent, setAllPartnersContent] = useState<Partner[]>([]);

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
    partnerLogoSrc: (partnerContent && partnerContent.partnershipLogo) || welcomeToBloom,
    partnerLogoAlt: 'alt.welcomeToBloom',
    imageSrc: illustrationBloomHeadYellow,
    imageAlt: 'alt.bloomHead',
  };

  const containerStyle = {
    ...rowStyle,
    backgroundColor: 'primary.light',
  } as const;

  const textContainerStyle = {
    maxWidth: 600,
    width: { xs: '100%', md: '45%' },
  } as const;

  const formContainerStyle = {
    width: { xs: '100%', sm: '70%', md: '45%' },
    alignSelf: 'flex-start',
  } as const;

  const imageContainerStyle = {
    position: 'relative',
    width: { xs: 120, md: 160 },
    height: { xs: 70, md: 80 },
    marginBottom: 3,
    marginTop: { xs: 0, md: 2 },
  } as const;

  const ExtraContent = () => {
    return (
      <>
        <Box sx={imageContainerStyle}>
          <Image alt={tS('alt.leafMix')} src={illustrationLeafMix} layout="fill" />
        </Box>
        <Typography variant="h3" component="h3">
          {t('register.moreInfoTitle')}
        </Typography>
        {partnerContent ? (
          // Show only the partner's welcome page link
          <>
            {/* <Link mt="1rem !important" href={`/welcome/${partnerContent.name.toLowerCase()}`}> */}
            <Link mt="1rem !important" href={`/welcome${codeParam && '?code=' + codeParam}`}>
              {t('aboutBloomFor')} {partnerContent.name}
            </Link>
          </>
        ) : (
          // Show the public bloom and all other partner's welcome page links
          <>
            <Typography>
              <Link href="/welcome">{t('aboutBloom')}</Link>
            </Typography>

            {allPartnersContent?.map((partner) => (
              <Typography key={`${partner.name}-link`} mt={0.5}>
                {/* <Link mt="1rem !important" href={`/welcome/${partner.name.toLowerCase()}`}> */}
                <Link mt="1rem !important" href={`/welcome${codeParam && '?code=' + codeParam}`}>
                  {t('aboutBloomFor')} {partner.name}
                </Link>
              </Typography>
            ))}
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
        <Box sx={formContainerStyle}>
          <Card>
            <CardContent>
              <Typography variant="h2" component="h2">
                {t('register.title')}
              </Typography>
              <Typography>{t('register.description')}</Typography>

              <RegisterForm codeParam={codeParam} partnerContent={partnerContent} />

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
          <Typography mt={3} textAlign="center">
            {t.rich('register.loginRedirect', {
              loginLink: (children) => <Link href="/auth/login">{children}</Link>,
            })}
          </Typography>
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
