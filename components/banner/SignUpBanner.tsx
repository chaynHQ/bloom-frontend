import { Button, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { STORYBLOK_COLORS } from '../../constants/enums';
import { SIGN_UP_TODAY_BANNER_BUTTON_CLICKED } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import Column from '../common/Column';
import Link from '../common/Link';
import PageSection from '../common/PageSection';
import Row from '../common/Row';

interface SignUpBannerProps {}

export const SignUpBanner = ({}: SignUpBannerProps) => {
  const t = useTranslations('Shared');
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);
  const [registerPath, setRegisterPath] = useState('/auth/register');

  useEffect(() => {
    const referralPartner = window.localStorage.getItem('referralPartner');

    if (referralPartner) {
      setRegisterPath(`/auth/register?partner=${referralPartner}`);
    }
  }, []);

  return (
    <PageSection color={STORYBLOK_COLORS.BLOOM_GRADIENT} alignment="center">
      <Row numberOfColumns={1} horizontalAlignment={'center'} verticalAlignment={'center'}>
        <Column>
          <Typography variant="h2" component="h2" mb={2}>
            {t('signUpTodayPromo.title')}
          </Typography>
          <Typography mb={2}>{t('signUpTodayPromo.description1')}</Typography>
          <Typography
            sx={{
              mb: '2rem !important',
            }}
          >
            {t('signUpTodayPromo.description2')}
          </Typography>
          <Button
            component={Link}
            variant="contained"
            color="secondary"
            href={registerPath}
            onClick={() => {
              logEvent(SIGN_UP_TODAY_BANNER_BUTTON_CLICKED, eventUserData);
            }}
          >
            {t('signUpTodayPromo.button')}
          </Button>
        </Column>
      </Row>
    </PageSection>
  );
};
