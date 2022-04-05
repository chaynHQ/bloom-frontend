import { GetUserResponse } from '../app/api';
import { analytics } from '../config/firebase';
import {
  joinedFeatureLiveChat,
  joinedFeatureTherapy,
  joinedPartners,
  totalTherapyRemaining,
} from './formatPartnerAccesses';

export const logEvent = (event: string, params?: {}) => {
  console.log(event, params);
  analytics?.logEvent(event, params!);
};

export const getEventUserData = (data: Partial<GetUserResponse>) => {
  return {
    registered_at: data.user?.createdAt,
    partner: joinedPartners(data.partnerAccesses),
    partner_live_chat: joinedFeatureLiveChat(data.partnerAccesses),
    partner_therapy: joinedFeatureTherapy(data.partnerAccesses),
    partner_therapy_remaining: totalTherapyRemaining(data.partnerAccesses),
    partner_therapy_redeemed: totalTherapyRemaining(data.partnerAccesses),
    partner_activated_at: data.partnerAccesses ? data.partnerAccesses[0]?.activatedAt : null,
  };
};

export default logEvent;
