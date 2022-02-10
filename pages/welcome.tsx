import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import CodeForm from '../components/CodeForm';
import Link from '../components/Link';
import PartnerHeader from '../components/PartnerHeader';
import bloomBumbleLogo from '../public/bloom_bumble_logo.svg';
import illustrationBloomHeadYellow from '../public/illustration_bloom_head_yellow.svg';
import illustrationLeafMix from '../public/illustration_leaf_mix.svg';
import illustrationLeafMixBee from '../public/illustration_leaf_mix_bee.svg';
import illustrationPerson5Yellow from '../public/illustration_person5_yellow.svg';
import { rowStyle } from '../styles/common';

const Welcome: NextPage = () => {
  const t = useTranslations('Welcome');
  const tS = useTranslations('Shared');
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const headerProps = {
    partnerLogoSrc: bloomBumbleLogo,
    partnerLogoAlt: 'alt.bloomBumbleLogo',
    imageSrc: illustrationBloomHeadYellow,
    imageAlt: 'alt.bloomHead',
  };

  const rowContainerStyle = {
    ...rowStyle,
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  } as const;

  const textContainerStyle = {
    maxWidth: 600,
    width: { xs: '100%', md: '45%' },
  } as const;

  const imageContainerStyle = {
    position: 'relative',
    width: { xs: 160, md: 225 },
    height: { xs: 160, md: 225 },
    marginX: { xs: 'auto', md: 12 },
    marginBottom: { xs: 4, md: 0 },
  } as const;

  const smallImageContainerStyle = {
    position: 'relative',
    width: { xs: 150, md: 180 },
    height: { xs: 70, md: 85 },
    marginBottom: { xs: 4, md: 6 },
    marginLeft: 12,
  } as const;

  const rowItem = {
    width: { xs: '100%', md: '45%' },
  } as const;

  const resourcesStyle = {
    fontSize: '1.125rem',
    maxWidth: 800,
    marginX: 'auto',
    textAlign: 'center',
  } as const;

  return (
    <Box>
      <Head>
        <title>{t('title')}</title>
      </Head>
      <PartnerHeader
        partnerLogoSrc={headerProps.partnerLogoSrc}
        partnerLogoAlt={headerProps.partnerLogoAlt}
        imageSrc={headerProps.imageSrc}
        imageAlt={headerProps.imageAlt}
      />
      <Container sx={{ ...rowContainerStyle, backgroundColor: 'primary.light' }}>
        <Box sx={textContainerStyle}>
          <Typography pb={2} variant="subtitle1" component="p">
            {t('introduction')}
          </Typography>
        </Box>
        <Card sx={rowItem}>
          <CardContent>
            <Typography variant="h2" component="h2">
              {t.rich('getStarted')}
            </Typography>
            <Typography variant="body1" component="p">
              {t.rich('accessIntroduction')}
            </Typography>

            <CodeForm />
          </CardContent>
        </Card>
      </Container>
      <Container sx={rowContainerStyle}>
        <Box sx={imageContainerStyle}>
          <Image alt={tS.raw('alt.personSitting')} src={illustrationPerson5Yellow} />
        </Box>
        <Box sx={rowItem}>
          <Typography variant="h2" component="h2">
            {t.rich('programTitle')}
          </Typography>
          <Typography variant="body1" component="p">
            {t.rich('programIntroduction')}
          </Typography>
        </Box>
      </Container>
      <Container sx={{ backgroundColor: 'common.white' }}>
        <Typography sx={resourcesStyle} variant="body1" component="p">
          {t.rich('resourcesIntroduction')}
        </Typography>
      </Container>
      <Container sx={{ ...rowContainerStyle, backgroundColor: 'secondary.light' }}>
        <Box sx={{ ...rowItem, mb: { xs: 8, md: 0 } }}>
          <Box sx={smallImageContainerStyle}>
            <Image alt={tS.raw('alt.leafMix')} src={illustrationLeafMix} />
          </Box>
          <Typography variant="h2" component="h2">
            {t.rich('bloomTitle')}
          </Typography>
          <Typography variant="body1" component="p">
            {t.rich('bloomIntroduction', {
              bloomLink: (children) => <Link href="https://chayn.co/">{children}</Link>,
            })}
          </Typography>
          <Button
            sx={{ mt: 3 }}
            variant="contained"
            fullWidth
            color="secondary"
            component={Link}
            href="/auth/register"
          >
            {t.rich('getStarted')}
          </Button>
        </Box>
        <Box sx={rowItem}>
          <Box sx={smallImageContainerStyle}>
            <Image alt={tS.raw('alt.leafMixBee')} src={illustrationLeafMixBee} />
          </Box>
          <Typography variant="h2" component="h2">
            {t.rich('bumbleTitle')}
          </Typography>
          <Typography variant="body1" component="p">
            {t.rich('bumbleIntroduction', {
              bumbleLink: (children) => (
                <Link href="https://bumble.com/?pid=press&c=press-release">{children}</Link>
              ),
            })}
          </Typography>
        </Box>
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
        ...require(`../messages/welcome/${locale}.json`),
      },
    },
  };
}

export default Welcome;
