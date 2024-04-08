import { track } from '@vercel/analytics/react';
import { getAnalytics } from 'firebase/analytics';
import { GetUserResponse } from '../app/api';
import { PartnerAccesses } from '../app/partnerAccessSlice';
import { PartnerAdmin } from '../app/partnerAdminSlice';
import {
  joinedFeatureLiveChat,
  joinedFeatureTherapy,
  joinedPartners,
  totalTherapyRemaining,
} from './formatPartnerAccesses';
import { getAccountType } from './getAccountType';

export const logEvent = (event: string, params?: {}) => {
  // Send analytics event to firebase / Google Analytics
  getAnalytics();
  (window as any).gtag('event', event, { method: 'Google', ...params });

  // Send analytics event to Vercel analytics
  // Don't include params as only 2 params are available on our plan
  track(event);
};

export const getEventUserData = (
  userCreatedAt: Date | null,
  partnerAccesses: PartnerAccesses,
  partnerAdmin: PartnerAdmin,
) => {
  return {
    account_type: getAccountType(partnerAdmin, partnerAccesses),
    registered_at: userCreatedAt,
    partner: joinedPartners(partnerAccesses, partnerAdmin),
    partner_live_chat: joinedFeatureLiveChat(partnerAccesses),
    partner_therapy: joinedFeatureTherapy(partnerAccesses),
    partner_therapy_remaining: totalTherapyRemaining(partnerAccesses),
    partner_therapy_redeemed: totalTherapyRemaining(partnerAccesses),
    partner_activated_at: partnerAccesses ? partnerAccesses[0]?.activatedAt : null,
  };
};

export const getEventUserResponseData = (userResponse: GetUserResponse) => {
  return getEventUserData(
    userResponse.user.createdAt,
    userResponse.partnerAccesses,
    userResponse.partnerAdmin,
  );
};

export default logEvent;
