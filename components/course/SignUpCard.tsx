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

// When the card sits inside a content card (a resource / session preview) it drops its own frame
// and leans on generous vertical padding to separate it from the description above.
const embeddedStyle = { border: 'none', backgroundColor: 'transparent', py: 4 } as const;

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
  // The placement this card sits in — the value reported on the sign-up funnel event. Copy follows
  // from it: `course`/`session` use the course wording; `resource`/`relatedSession` use the
  // resource wording (a per-`format` title, or a session-specific one for `relatedSession`).
  source: 'course' | 'session' | 'resource' | 'relatedSession';
  format?: ContentType;
  // Where "log in" returns the visitor; defaults to the current page.
  returnPath?: string;
  // Drop the card frame when rendered inside a content card.
  embedded?: boolean;
}

export function SignUpCard({ source, format, returnPath, embedded }: SignUpCardProps) {
  const tCourse = useTranslations('Courses.courseDetail.accessCard');
  const tResource = useTranslations('Resources.accessCard');
  const tS = useTranslations('Shared.signUpSection');
  const registerPath = useRegisterPath();
  const pathname = usePathname();
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

  const isCourseCopy = source === 'course' || source === 'session';
  const t = isCourseCopy ? tCourse : tResource;
  const title = isCourseCopy
    ? tCourse('title')
    : source === 'relatedSession'
      ? tResource('relatedSession.title')
      : tResource(`title.${format ?? 'video'}`);
  const body = t('body');
  const logIn = t('logIn');

  const returnUrl = encodeURIComponent(returnPath ?? pathname);

  return (
    <Box qa-id="access-full-course-card" sx={{ ...cardStyle, ...(embedded && embeddedStyle) }}>
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
