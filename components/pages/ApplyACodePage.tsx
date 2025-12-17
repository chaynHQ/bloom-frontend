'use client';

import ApplyCodeForm from '@/components/forms/ApplyCodeForm';
import Header from '@/components/layout/Header';
import { Link as i18nLink } from '@/i18n/routing';
import { ASSIGN_NEW_PARTNER_VIEWED } from '@/lib/constants/events';
import { getAllPartnersContent } from '@/lib/constants/partners';
import { getImageSizes } from '@/lib/utils/imageSizes';
import logEvent from '@/lib/utils/logEvent';
import illustrationPerson4Peach from '@/public/illustration_person4_peach.svg';
import { rowStyle } from '@/styles/common';
import { Box, Card, CardContent, Container, Link, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useMemo } from 'react';

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

export default function ApplyACodePage() {
  const t = useTranslations('Account');
  const tS = useTranslations('Shared');

  const allPartnersContent = useMemo(() => getAllPartnersContent(), []);

  useEffect(() => {
    logEvent(ASSIGN_NEW_PARTNER_VIEWED);
  }, []);

  const headerProps = {
    title: t('applyCode.title'),
    introduction: t('applyCode.introduction'),
    imageSrc: illustrationPerson4Peach,
    imageAlt: 'alt.personTea',
  };

  return (
    <Box>
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
                    component={i18nLink}
                    sx={logoContainerStyle}
                    key={`${partner.name}-link`}
                    aria-label={tS(partner.logoAlt)}
                    mt="1rem !important"
                    href={`/welcome/${partner.name.toLowerCase()}`}
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
}
