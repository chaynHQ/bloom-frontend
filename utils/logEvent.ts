import { GetUserResponse } from '../app/api';
import { analytics } from '../config/firebase';

export const logEvent = (event: string, params?: {}) => {
  analytics?.logEvent(event, params!);
};

export const getEventUserData = (data: GetUserResponse) => {
  const userData = {
    createdAt: data.user.createdAt,
    updatedAt: data.user.updatedAt,
    languageDefault: data.user.languageDefault,
  };

  if (data.partnerAccess) {
    const userPartnerData = {
      ...userData,
      partner: data.partner.name,
      partner_activated_at: data.partnerAccess.activatedAt,
      feature_live_chat: data.partnerAccess.featureLiveChat,
      feature_therapy: data.partnerAccess.featureTherapy,
      therapy_sessions_remaining: data.partnerAccess.therapySessionsRemaining,
      therapy_sessions_redeemed: data.partnerAccess.therapySessionsRedeemed,
    };
    return userPartnerData;
  }

  return userData;
};

export default logEvent;
