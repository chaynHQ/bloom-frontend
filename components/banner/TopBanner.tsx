'use client';

import { FeatureFlag } from '@/lib/featureFlag';
import { useTypedSelector } from '@/lib/hooks/store';
import { useLocale } from 'next-intl';
import PartnerSurveyBanner, { getPartnerSurvey } from './PartnerSurveyBanner';
import RedesignNewsBanner from './RedesignNewsBanner';

// The one banner slot beneath the TopBar. Bumble and Badoo members get their partner survey in
// place of the redesign news; everyone else, and members before their partner accesses load, the
// news.
export default function TopBanner() {
  const locale = useLocale();
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);

  const partnerSurvey =
    FeatureFlag.isPartnerSurveyBannerEnabled() && locale === 'en'
      ? getPartnerSurvey(partnerAccesses)
      : undefined;

  if (partnerSurvey) return <PartnerSurveyBanner survey={partnerSurvey} />;

  return FeatureFlag.isRedesignNewsBannerEnabled() ? <RedesignNewsBanner /> : null;
}
