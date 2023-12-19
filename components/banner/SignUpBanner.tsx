import { Button, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { STORYBLOK_COLORS } from '../../constants/enums';
import Column from '../common/Column';
import Link from '../common/Link';
import PageSection from '../common/PageSection';
import Row from '../common/Row';

interface SignUpBannerProps {}

export const SignUpBanner = ({}: SignUpBannerProps) => {
  const t = useTranslations('Shared');

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
          <Button component={Link} variant="contained" color="secondary" href={'/auth/register'}>
            {t('signUpTodayPromo.button')}
          </Button>
        </Column>
      </Row>
    </PageSection>
  );
};
