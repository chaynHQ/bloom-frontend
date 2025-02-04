import { PartnerAccesses } from '@/lib/store/partnerAccessSlice';
import { PartnerAdmin } from '@/lib/store/partnerAdminSlice';
import { sendGAEvent } from '@next/third-parties/google';
import { track } from '@vercel/analytics/react';
import {
  joinedFeatureLiveChat,
  joinedFeatureTherapy,
  joinedPartners,
  totalTherapyRemaining,
} from './formatPartnerAccesses';
import { AccountType, getAccountType } from './getAccountType';

interface EventUserData {
  account_type?: AccountType | null;
  partner?: string | null;
  partner_live_chat?: string | null;
  partner_therapy?: string | null;
  partner_therapy_remaining?: number | null;
  partner_therapy_redeemed?: number | null;
  partner_activated_at?: string | Date | null;
  registered_at?: string | Date | null;
}

const logEvent = (event: string, params = {}) => {
  // Send analytics events to Google Analytics and Vercel Analytics
  sendGAEvent('event', event, params);
  track(event, params);
};

export const getEventUserData = (
  userCreatedAt: Date | null,
  partnerAccesses: PartnerAccesses,
  partnerAdmin: PartnerAdmin,
): EventUserData => {
  try {
    return {
      account_type: getAccountType(partnerAdmin, partnerAccesses),
      registered_at: userCreatedAt,
      ...(partnerAccesses?.length > 0 && {
        partner: joinedPartners(partnerAccesses, partnerAdmin),
        partner_live_chat: joinedFeatureLiveChat(partnerAccesses),
        partner_therapy: joinedFeatureTherapy(partnerAccesses),
        partner_therapy_remaining: totalTherapyRemaining(partnerAccesses),
        partner_therapy_redeemed: totalTherapyRemaining(partnerAccesses),
        partner_activated_at: partnerAccesses ? partnerAccesses[0]?.activatedAt : null,
      }),
    };
  } catch (error) {
    console.error('getEventUserData error:', error);
    return {};
  }
};

export default logEvent;
