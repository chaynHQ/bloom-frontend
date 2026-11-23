'use client';

import {
  USER_BANNER_DISMISSED,
  USER_BANNER_INTERESTED,
  USER_BANNER_VIEWED,
} from '@/lib/constants/events';
import { FeatureFlag } from '@/lib/featureFlag';
import { useLocale } from 'next-intl';
import DismissibleTopBanner from './DismissibleTopBanner';

const USER_RESEARCH_BANNER_INTERACTED = 'user_research_banner_interacted';
const USER_RESEARCH_FORM_LINK =
  'https://docs.google.com/forms/d/e/1FAIpQLSfBwYdXRKDX_IKtcShgYvNu835BqtI5PbIC-GrmBBVIZDpQgw/viewform?usp=sf_link';

const EVENTS = {
  viewed: USER_BANNER_VIEWED,
  actionClicked: USER_BANNER_INTERESTED,
  dismissed: USER_BANNER_DISMISSED,
} as const;

// The study runs in English only, so the banner is gated on the `en` locale and its copy is not
// translated. Move to i18n/messages if the study opens up to other languages.
const COPY = {
  regionLabel: 'Bloom user research',
  headline: 'Take part in Bloom research for $75',
  supportingText: ' — test new designs and help us make Bloom better for survivors.',
  accept: 'I’m interested',
  dismiss: 'Dismiss',
} as const;

export default function UserResearchBanner() {
  const locale = useLocale();

  if (!FeatureFlag.isUserResearchBannerEnabled() || locale !== 'en') return null;

  return (
    <DismissibleTopBanner
      cookieName={USER_RESEARCH_BANNER_INTERACTED}
      regionLabel={COPY.regionLabel}
      message={
        <>
          <strong>{COPY.headline}</strong>
          {COPY.supportingText}
        </>
      }
      actionLabel={COPY.accept}
      actionHref={USER_RESEARCH_FORM_LINK}
      dismissLabel={COPY.dismiss}
      dismissOnAction
      events={EVENTS}
    />
  );
}
