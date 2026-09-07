'use client';

import { Link as i18nLink, usePathname } from '@/i18n/routing';
import { SIGN_UP_TODAY_BANNER_BUTTON_CLICKED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { useRegisterPath } from '@/lib/hooks/useRegisterPath';
import { type ContentType } from '@/lib/utils/libraryData';
import { getImageSizes } from '@/lib/utils/imageSizes';
import logEvent, { getEventUserData } from '@/lib/utils/logEvent';
import illustration from '@/public/illustration_access_course.svg';
import { Box, Button, Link, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const cardStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
  p: 2,
  borderRadius: '8px',
  border: '1px solid',
  borderColor: 'cardBorder',
  backgroundColor: 'pageBackground',
  width: { xs: '100%', md: 360 },
  maxWidth: '100%',
  alignSelf: 'center',
  mx: 'auto',
} as const;

const introStyle = { display: 'flex', alignItems: 'center', gap: 1.5 } as const;
const imageStyle = { position: 'relative', flexShrink: 0, width: 88, height: 77 } as const;
const copyStyle = { display: 'flex', flexDirection: 'column', gap: 0.5 } as const;
const titleStyle = { fontWeight: 500 } as const;
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

interface SignUpCardProps {
  // Where the card is shown, for the sign-up funnel event, and which copy to use. `course` and
  // `session` share the course copy; `resource` takes a per-format title from `format`;
  // `relatedSession` is the upsell on a resource that excerpts a full session.
  source: 'course' | 'session' | 'resource' | 'relatedSession';
  format?: ContentType;
  // Where "log in" returns the visitor; defaults to the current page.
  returnPath?: string;
}

export function SignUpCard({ source, format, returnPath }: SignUpCardProps) {
  const tCourse = useTranslations('Courses.courseDetail.accessCard');
  const tResource = useTranslations('Resources.accessCard');
  const tS = useTranslations('Shared.signUpSection');
  const registerPath = useRegisterPath();
  const pathname = usePathname();
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

  let title: string;
  let body: string;
  let logIn: string;
  if (source === 'course' || source === 'session') {
    title = tCourse('title');
    body = tCourse('body');
    logIn = tCourse('logIn');
  } else if (source === 'relatedSession') {
    title = tResource('relatedSession.title');
    body = tResource('body');
    logIn = tResource('logIn');
  } else {
    title = tResource(`title.${format ?? 'video'}`);
    body = tResource('body');
    logIn = tResource('logIn');
  }

  const returnUrl = encodeURIComponent(returnPath ?? pathname);

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
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'grey.700' }}>
            {body}
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
      <Link
        qa-id="access-full-course-login-link"
        component={i18nLink}
        href={`/auth/login?return_url=${returnUrl}`}
        sx={logInStyle}
      >
        {logIn}
      </Link>
    </Box>
  );
}
