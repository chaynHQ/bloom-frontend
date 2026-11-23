'use client';

import {
  REDESIGN_BANNER_DISMISSED,
  REDESIGN_BANNER_FEEDBACK_CLICKED,
  REDESIGN_BANNER_VIEWED,
} from '@/lib/constants/events';
import { useTranslations } from 'next-intl';
import DismissibleTopBanner from './DismissibleTopBanner';

const REDESIGN_NEWS_BANNER_INTERACTED = 'redesign_news_banner_interacted';

const FEEDBACK_FORM_LINK =
  'https://form.typeform.com/to/OY9Wdk4h?typeform-source=chayn.typeform.com';

const EVENTS = {
  viewed: REDESIGN_BANNER_VIEWED,
  actionClicked: REDESIGN_BANNER_FEEDBACK_CLICKED,
  dismissed: REDESIGN_BANNER_DISMISSED,
} as const;

export default function RedesignNewsBanner({ trackView }: { trackView?: boolean }) {
  const t = useTranslations('RedesignBanner');

  return (
    <DismissibleTopBanner
      cookieName={REDESIGN_NEWS_BANNER_INTERACTED}
      regionLabel={t('regionLabel')}
      message={
        <>
          <strong>{t('headline')}</strong> {t('supportingText')}
        </>
      }
      actionLabel={t('feedback')}
      actionShortLabel={t('feedbackShort')}
      actionHref={FEEDBACK_FORM_LINK}
      dismissLabel={t('dismiss')}
      events={EVENTS}
      trackView={trackView}
    />
  );
}
