import { GetUserResponse } from '../app/api';
import { analytics } from '../config/firebase';

export const logEvent = (event: string, params?: {}) => {
  analytics?.logEvent(event, params!);
};

export const getEventUserData = (data: Partial<GetUserResponse>) => {
  return {
    registered_at: data.user?.createdAt,
    partner_access: data.partnerAccesses?.map((partnerAccess) => {
      return {
        partner_name: partnerAccess.partner.name,
        feature_live_chat: partnerAccess.featureLiveChat,
        feature_therapy: partnerAccess.featureTherapy,
        therapy_sessions_remaining: partnerAccess.therapySessionsRemaining,
        therapy_sessions_redeemed: partnerAccess.therapySessionsRedeemed,
        activated_at: partnerAccess.activatedAt,
      };
    }),
  };
};

export default logEvent;
