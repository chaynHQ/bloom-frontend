import { Card, CardContent } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { RootState } from '../../app/store';
import Link from '../../components/common/Link';
import ApplyCodeForm from '../../components/forms/ApplyCodeForm';
import Header from '../../components/layout/Header';
import { ASSIGN_NEW_PARTNER_VIEWED } from '../../constants/events';
import { getAllPartnersContent, PartnerContent } from '../../constants/partners';
import { useTypedSelector } from '../../hooks/store';
import illustrationPerson4Peach from '../../public/illustration_person4_peach.svg';
import { rowStyle } from '../../styles/common';
import logEvent, { getEventUserData } from '../../utils/logEvent';

const containerStyle = {
  ...rowStyle,
  backgroundColor: 'primary.light',
} as const;

const infoContainerStyle = {
  maxWidth: 600,
  width: { xs: '100%', md: '45%' },
} as const;

const formContainerStyle = {
  width: { xs: '100%', sm: '70%', md: '45%' },
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

const partnerCardStyle = {
  marginY: { xs: 2, md: 3 },
} as const;

const ApplyACode: NextPage = () => {
  const t = useTranslations('Account');
  const tS = useTranslations('Shared');

  const { user, partnerAccesses, partnerAdmin } = useTypedSelector((state: RootState) => state);
  const [allPartnersContent, setAllPartnersContent] = useState<PartnerContent[]>([]);

  useEffect(() => {
    setAllPartnersContent(getAllPartnersContent());
  }, []);

  useEffect(() => {
    const eventUserData = getEventUserData({ user, partnerAccesses, partnerAdmin });

    logEvent(ASSIGN_NEW_PARTNER_VIEWED, eventUserData);
  }, []);

  const headerProps = {
    title: t('applyCode.title'),
    introduction: t('applyCode.introduction'),
    imageSrc: illustrationPerson4Peach,
    imageAlt: 'alt.personTea',
  };

  return (
    <Box>
      <Head>
        <title>{t('applyCode.title')}</title>
      </Head>
      <Header
        title={headerProps.title}
        introduction={headerProps.introduction}
        imageSrc={headerProps.imageSrc}
        imageAlt={headerProps.imageAlt}
      />
      <Container sx={containerStyle}>
        <Box sx={infoContainerStyle}>
          <Typography variant="subtitle1" component="p">
            {t('applyCode.description')}
          </Typography>
          <Typography mt={2} mb={4} variant="subtitle1" component="p">
            {t('applyCode.descriptionLine2')}
          </Typography>
          <Card sx={partnerCardStyle}>
            <CardContent>
              <Typography variant="h3" component="h3">
                {t('applyCode.partnershipsTitle')}
              </Typography>
              <Typography>{t('applyCode.partnershipsDescription')}</Typography>
              <Box sx={logosContainerStyle}>
                {allPartnersContent?.map((partner) => (
                  <Link
                    sx={logoContainerStyle}
                    key={`${partner.name}-link`}
                    aria-label={tS(partner.logoAlt)}
                    mt="1rem !important"
                    href={`/welcome/${partner.name.toLowerCase()}`}
                  >
                    <Image
                      alt={tS(partner.logoAlt)}
                      src={partner.logo}
                      layout="fill"
                      objectFit="contain"
                    />
                  </Link>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={formContainerStyle}>
          <Card>
            <CardContent>
              <Typography variant="h2" component="h2">
                {t('applyCode.title')}
              </Typography>
              <ApplyCodeForm />
            </CardContent>
          </Card>
        </Box>
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
        ...require(`../../messages/account/${locale}.json`),
        ...require(`../../messages/auth/${locale}.json`),
      },
    },
  };
}

export default ApplyACode;
