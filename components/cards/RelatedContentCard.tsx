'use client';

import { Link as i18nLink } from '@/i18n/routing';
import { RELATED_CONTENT_CATEGORIES } from '@/lib/constants/enums';
import { RELATED_CONTENT_CARD_CLICK } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent, { getEventUserData } from '@/lib/utils/logEvent';
import { ArrowForwardIos } from '@mui/icons-material';
import { Box, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

const cardStyle = {
  mt: 0,
  width: '100%',
  minWidth: { xs: '100%', md: '17rem' },
  mb: { xs: '1rem', sm: '1.5rem' },
  backgroundColor: 'paleSecondaryLight',
} as const;

const categoryStyle = {
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.875rem !important',
  textTransform: 'uppercase',
  mb: '0.5rem !important',
  '& .before-dot:before': {
    content: '"• "',
    marginLeft: 1,
    marginRight: 1,
  },
} as const;

const cardContentStyle = {
  minHeight: { xs: 160, md: 190 },
  paddingY: { xs: '1.5rem', md: '2rem !important' },
  paddingX: { xs: '1.5rem', md: '1.75rem !important' },
} as const;

interface RelatedContentProps {
  title: string;
  href: string;
  category: RELATED_CONTENT_CATEGORIES;
  duration?: string;
}

export const RelatedContentCard = (props: RelatedContentProps) => {
  const { title, href, category, duration } = props;
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  const t = useTranslations('Resources.relatedContent');
  const handleClick = () => {
    logEvent(RELATED_CONTENT_CARD_CLICK, eventUserData);
  };

  return (
    <Card sx={cardStyle}>
      <CardActionArea
        href={href}
        component={i18nLink}
        onClick={() => {
          handleClick();
        }}
      >
        <CardContent sx={cardContentStyle}>
          <Box position="relative" width="100%" paddingRight={1}>
            <Box>
              <Typography sx={categoryStyle}>
                {t(category)}
                {duration && (
                  <span className="before-dot">{` ${duration} ${t('minuteLabel')}`}</span>
                )}
              </Typography>
              <Typography variant="h3" mb={0}>
                {title}
              </Typography>
            </Box>
            <ArrowForwardIos
              color="error"
              sx={{ fontSize: '20px', position: 'absolute', right: -10, top: -5 }}
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
