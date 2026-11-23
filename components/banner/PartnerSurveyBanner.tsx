'use client';

import {
  PARTNER_SURVEY_BANNER_CLICKED,
  PARTNER_SURVEY_BANNER_DISMISSED,
  PARTNER_SURVEY_BANNER_VIEWED,
} from '@/lib/constants/events';
import { PartnerAccesses } from '@/lib/store/partnerAccessSlice';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import DismissibleTopBanner from './DismissibleTopBanner';

export interface PartnerSurvey {
  partner: string;
  href: string;
}

// Keyed by lower-cased backend partner name. The surveys are in English only.
const PARTNER_SURVEYS: Record<string, PartnerSurvey> = {
  bumble: { partner: 'Bumble', href: 'https://form.typeform.com/to/o38bzFOL' },
  badoo: { partner: 'Badoo', href: 'https://form.typeform.com/to/cjtDVKyF' },
};

const PARTNER_SURVEY_BANNER_INTERACTED = 'partner_survey_2026_banner_interacted';

const EVENTS = {
  viewed: PARTNER_SURVEY_BANNER_VIEWED,
  actionClicked: PARTNER_SURVEY_BANNER_CLICKED,
  dismissed: PARTNER_SURVEY_BANNER_DISMISSED,
} as const;

// A member of both partners gets the survey of whichever access comes first.
export function getPartnerSurvey(partnerAccesses: PartnerAccesses): PartnerSurvey | undefined {
  for (const partnerAccess of partnerAccesses) {
    const survey = PARTNER_SURVEYS[partnerAccess.partner.name.toLowerCase()];
    if (survey) return survey;
  }
  return undefined;
}

export default function PartnerSurveyBanner({ survey }: { survey: PartnerSurvey }) {
  const t = useTranslations('PartnerSurveyBanner');
  const eventParams = useMemo(() => ({ partner: survey.partner }), [survey.partner]);

  return (
    <DismissibleTopBanner
      cookieName={PARTNER_SURVEY_BANNER_INTERACTED}
      regionLabel={t('regionLabel', { partner: survey.partner })}
      message={t.rich('message', {
        partner: survey.partner,
        strong: (chunks) => <strong>{chunks}</strong>,
      })}
      actionLabel={t('takeSurvey')}
      actionHref={survey.href}
      dismissLabel={t('dismiss')}
      dismissOnAction
      events={EVENTS}
      eventParams={eventParams}
    />
  );
}
