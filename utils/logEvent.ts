import { GetUserResponse } from '../app/api';
import { analytics } from '../config/firebase';

export const logEvent = (event: string, params?: {}) => {
  analytics?.logEvent(event, params!);
};

export const getEventUserData = (data: Partial<GetUserResponse>) => {
  return {
    registered_at: data.user?.createdAt,
    partner: data.partnerAccesses
      ? data.partnerAccesses.map((pa) => pa.partner.name).join(', ')
      : 'none',
    partner_live_chat: data.partnerAccesses
      ? data.partnerAccesses
          .map((pa) => {
            if (pa.featureLiveChat) return pa.partner.name;
          })
          .join(', ')
      : 'none',
    partner_therapy: data.partnerAccesses
      ? data.partnerAccesses
          .map((pa) => {
            if (pa.featureTherapy) return pa.partner.name;
          })
          .join(', ')
      : 'none',
    partner_therapy_remaining: data.partnerAccesses
      ? data.partnerAccesses.reduce(function (total, pa) {
          // return the sum with previous value
          return total + pa.therapySessionsRemaining;
        }, 0)
      : 0,
    partner_therapy_redeemed: data.partnerAccesses
      ? data.partnerAccesses.reduce(function (total, pa) {
          // return the sum with previous value
          return total + pa.therapySessionsRedeemed;
        }, 0)
      : 0,
    partner_activated_at: data.partnerAccesses ? data.partnerAccesses[0].activatedAt : null,
  };
};

export default logEvent;
