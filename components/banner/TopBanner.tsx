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
  const userResolved = useTypedSelector(
    ({ user }) => !user.authStateLoading && !user.loading && (!user.token || !!user.id),
  );

  const partnerSurvey =
    FeatureFlag.isPartnerSurveyBannerEnabled() && locale === 'en'
      ? getPartnerSurvey(partnerAccesses)
      : undefined;

  if (partnerSurvey) return <PartnerSurveyBanner survey={partnerSurvey} />;

  // The news shows from the first paint, so it isn't counted as viewed until the user has
  // loaded and it's known not to give way to a survey.
  if (FeatureFlag.isRedesignNewsBannerEnabled()) {
    return <RedesignNewsBanner trackView={userResolved} />;
  }

  return null;
}
