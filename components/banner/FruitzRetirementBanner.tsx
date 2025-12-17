'use client';

import { usePathname } from '@/i18n/routing';
import { FRUITZ_RETIREMENT_BANNER_DISMISSED } from '@/lib/constants/events';
import { FeatureFlag } from '@/lib/featureFlag';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent from '@/lib/utils/logEvent';
import { Alert, AlertTitle, Button, Collapse, Container, Stack } from '@mui/material';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

const alertStyle = {
  backgroundColor: 'secondary.light',
  color: 'text.primary',
  boxShadow: 1,
  borderRadius: 0.6,
  padding: 2,
  px: 3,
  'flex-direction': 'column',
};

const FRUITZ_RETIREMENT_BANNER_INTERACTED = 'fruitz_retirement_banner_interacted';

export const FruitzRetirementBanner = () => {
  const t = useTranslations('Shared.fruitzRetirementBanner');

  const [open, setOpen] = useState(true);
  const pathname = usePathname();

  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);

  const isBannerNotInteracted = !Boolean(Cookies.get(FRUITZ_RETIREMENT_BANNER_INTERACTED));
  const isBannerFeatureEnabled = FeatureFlag.isFruitzRetirementBannerEnabled();

  const isFruitzUser = partnerAccesses.find((pa) => {
    return pa.partner.name.toLowerCase() === 'fruitz';
  });

  const isTargetPage = !pathname.includes('auth');
  const isFruitzWelcomePage = pathname.includes('fruitz');

  const showBanner =
    (isBannerFeatureEnabled && isFruitzUser && isTargetPage && isBannerNotInteracted) ||
    isFruitzWelcomePage;

  const handleClickDeclined = () => {
    Cookies.set(FRUITZ_RETIREMENT_BANNER_INTERACTED, 'true');
    logEvent(FRUITZ_RETIREMENT_BANNER_DISMISSED);
    setOpen(false);
  };
  const containerStyle = {
    backgroundColor: isFruitzWelcomePage ? 'white' : 'primary.main',
    pt: '2rem !important',
    pb: '0 !important',
  } as const;

  if (!showBanner) return null;

  return (
    <Container sx={containerStyle}>
      <Stack spacing={2}>
        <Collapse in={open}>
          <Alert
            icon={false}
            sx={alertStyle}
            action={
              <Button
                color="secondary"
                variant="outlined"
                size="small"
                onClick={handleClickDeclined}
              >
                {t('dismiss')}
              </Button>
            }
          >
            <AlertTitle>
              <strong>{t('title')}</strong>
            </AlertTitle>
            {t('description')}
          </Alert>
        </Collapse>
      </Stack>
    </Container>
  );
};
