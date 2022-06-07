import { GetUserResponse } from '../app/api';
import { analytics } from '../config/firebase';
import {
  joinedFeatureLiveChat,
  joinedFeatureTherapy,
  joinedPartners,
  totalTherapyRemaining,
} from './formatPartnerAccesses';
import { getAccountType } from './getAccountType';

export const logEvent = (event: string, params?: {}) => {
  analytics?.logEvent(event, params!);
};

export const getEventUserData = (data: Partial<GetUserResponse>) => {
  return {
    account_type: getAccountType(data.partnerAdmin, data.partnerAccesses),
    registered_at: data.user?.createdAt,
    partner: joinedPartners(data.partnerAccesses, data.partnerAdmin),
    partner_live_chat: joinedFeatureLiveChat(data.partnerAccesses),
    partner_therapy: joinedFeatureTherapy(data.partnerAccesses),
    partner_therapy_remaining: totalTherapyRemaining(data.partnerAccesses),
    partner_therapy_redeemed: totalTherapyRemaining(data.partnerAccesses),
    partner_activated_at: data.partnerAccesses ? data.partnerAccesses[0]?.activatedAt : null,
  };
};

export default logEvent;
