import { Box, Card, CardContent, Container, Typography, useMediaQuery, useTheme } from '@mui/material';
import { NextPage } from 'next';
import { GetStaticPropsContext } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Link from '../../components/common/Link';
import LoginForm from '../../components/forms/LoginForm';
import PartnerHeader from '../../components/layout/PartnerHeader';
import { GET_STARTED_WITH_BLOOM_CLICKED, RESET_PASSWORD_HERE_CLICKED, generateGetStartedPartnerEvent } from '../../constants/events';
import { getAllPartnersContent } from '../../constants/partners';
import { useTypedSelector } from '../../hooks/store';
import welcomeToBloom from '../../public/welcome_to_bloom.svg';
import illustrationBloomHeadYellow from '../../public/illustration_bloom_head_yellow.svg';
import illustrationLeafMix from '../../public/illustration_leaf_mix.svg';
import logEvent, { getEventUserData } from '../../utils/logEvent';

const Login: NextPage = () => {
  const t = useTranslations('Auth');
  const tS = useTranslations('Shared');
  const theme = useTheme();
  const router = useRouter();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const { token: userToken, id: userId, createdAt: userCreatedAt } = useTypedSelector(state => state.user);
  const { partnerAccesses, partnerAdmin } = useTypedSelector(state => state);

  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  useEffect(() => {
    if (!userId) return;
    const returnUrl = typeof router.query.return_url === 'string' ? router.query.return_url : null;

    if (!!partnerAdmin?.id) {
      router.push('/partner-admin/create-access-code');
    } else if (!!returnUrl) {
      router.push(returnUrl);
    } else {
      router.push('/courses');
    }
  }, [userId, partnerAdmin?.id, router]);

  const ExtraContent = () => (
    <>
      <Box sx={{ position: 'relative', width: { xs: 120, md: 160 }, height: { xs: 70, md: 80 }, marginBottom: 3, marginTop: { xs: 0, md: 2 } }}>
        <Image alt={tS('alt.leafMix')} src={illustrationLeafMix} layout="fill" />
      </Box>
      <Typography variant="h3" component="h3">{t('login.newUserTitle')}</Typography>
      <Typography>
        <Link onClick={() => logEvent(GET_STARTED_WITH_BLOOM_CLICKED, eventUserData)} href="/">{t('getStartedBloom')}</Link>
      </Typography>
      {getAllPartnersContent()?.map(partner => (
        <Typography key={`${partner.name}-link`} mt={0.5}>
          <Link mt="1rem !important" href={`/welcome/${partner.name.toLowerCase()}`} onClick={() => logEvent(generateGetStartedPartnerEvent(partner.name), eventUserData)}>
            {t.rich('getStartedWith', { partnerName: partner.name })}
          </Link>
        </Typography>
      ))}
    </>
  );

  return (
    <Box>
      <Head>
        <title>{t('login.title')}</title>
      </Head>
      <PartnerHeader partnerLogoSrc={welcomeToBloom} partnerLogoAlt="alt.welcomeToBloom" imageSrc={illustrationBloomHeadYellow} imageAlt="alt.bloomHead" />
      <Container sx={{ display: 'flex', backgroundColor: 'primary.light', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: theme.spacing(2, 0) }}>
        <Box sx={{ maxWidth: 600, width: { xs: '100%', md: '45%' } }}>
          <Typography pb={2} variant="subtitle1" component="p">{t('introduction')}</Typography>
          {!isSmallScreen && <ExtraContent />}
        </Box>
        <Card sx={{ width: { xs: '100%', sm: '70%', md: '45%' }, alignSelf: 'flex-start', mt: isSmallScreen ? 2 : 0 }}>
          <CardContent>
            <Typography variant="h2" component="h2">{t('login.title')}</Typography>
            <LoginForm />
            <Typography textAlign="center">
              {t.rich('login.resetPasswordLink', {
                resetLink: children => (
                  <Link onClick={() => logEvent(RESET_PASSWORD_HERE_CLICKED, eventUserData)} href="/auth/reset-password">{children}</Link>
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

export default Login;
