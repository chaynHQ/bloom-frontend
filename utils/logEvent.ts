import { GetUserResponse } from '../app/api';
import { analytics } from '../config/firebase';

export const logEvent = (event: string, params?: {}) => {
  analytics?.logEvent(event, params!);
};

export const getEventUserData = (data: GetUserResponse) => {
  const userData = {
    partner: data.partner.name,
    activated_at: data.partnerAccess.activatedAt,
    feature_live_chat: data.partnerAccess.featureLiveChat,
    feature_therapy: data.partnerAccess.featureTherapy,
    therapy_sessions_remaining: data.partnerAccess.therapySessionsRemaining,
    therapy_sessions_redeemed: data.partnerAccess.therapySessionsRedeemed,
  };
  return userData;
};

export default logEvent;
