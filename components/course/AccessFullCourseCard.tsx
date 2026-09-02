'use client';

import { Link as i18nLink } from '@/i18n/routing';
import { SIGN_UP_TODAY_BANNER_BUTTON_CLICKED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { useRegisterPath } from '@/lib/hooks/useRegisterPath';
import { getImageSizes } from '@/lib/utils/imageSizes';
import logEvent, { getEventUserData } from '@/lib/utils/logEvent';
import illustration from '@/public/illustration_access_course.svg';
import { Box, Button, Link, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

// `cardSurface` (not `pageBackground`) so the card reads as a card on both the pink course hero
// and the pale session page, where the page itself is `pageBackground`. Caps at the course hero's
// 360px rail and centres itself in a wider column (the session page).
const cardStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
  p: 2,
  borderRadius: '8px',
  border: '1px solid',
  borderColor: 'cardBorder',
  backgroundColor: 'cardSurface',
  width: { xs: '100%', md: 360 },
  maxWidth: '100%',
  alignSelf: 'center',
  mx: 'auto',
} as const;

const introStyle = { display: 'flex', alignItems: 'center', gap: 1.5 } as const;
const imageStyle = { position: 'relative', flexShrink: 0, width: 88, height: 77 } as const;
const copyStyle = { display: 'flex', flexDirection: 'column', gap: 0.5 } as const;
const titleStyle = { fontWeight: 600 } as const;
// The button fills the card; the theme caps buttons at 25rem, which is narrower than the card on
// a wide mobile viewport.
const ctaStyle = { maxWidth: 'none' } as const;
const logInStyle = {
  alignSelf: 'center',
  fontFamily: 'headingFontFamily',
  fontWeight: 500,
  fontSize: '0.875rem',
  color: 'primary.dark',
} as const;

interface AccessFullCourseCardProps {
  // Where the card is shown, for the sign-up funnel event.
  source: 'course' | 'session';
}

export function AccessFullCourseCard({ source }: AccessFullCourseCardProps) {
  const t = useTranslations('Courses.courseDetail.accessCard');
  const tS = useTranslations('Shared.signUpSection');
  const registerPath = useRegisterPath();
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

  return (
    <Box qa-id="access-full-course-card" sx={cardStyle}>
      <Box sx={introStyle}>
        <Box sx={imageStyle}>
          <Image
            alt=""
            src={illustration}
            fill
            sizes={getImageSizes(imageStyle.width)}
            style={{ objectFit: 'contain' }}
          />
        </Box>
        <Box sx={copyStyle}>
          <Typography variant="h4" component="p" sx={titleStyle}>
            {t('title')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'grey.700' }}>
            {t('body')}
          </Typography>
        </Box>
      </Box>

      <Button
        qa-id="access-full-course-cta"
        variant="contained"
        color="error"
        fullWidth
        sx={ctaStyle}
        component={i18nLink}
        href={registerPath}
        onClick={() =>
          logEvent(SIGN_UP_TODAY_BANNER_BUTTON_CLICKED, {
            sign_up_section_source: source,
            ...getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin),
          })
        }
      >
        {tS('cta')}
      </Button>
      <Link component={i18nLink} href="/auth/login" sx={logInStyle}>
        {t('logIn')}
      </Link>
    </Box>
  );
}
