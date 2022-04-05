import { PartnerAccess } from '../app/partnerAccessSlice';

export const joinedPartners = (partnerAccesses: PartnerAccess[] | undefined): string | null => {
  if (!partnerAccesses) return null;
  return partnerAccesses.map((pa) => pa.partner.name).join(', ');
};

export const joinedFeatureLiveChat = (
  partnerAccesses: PartnerAccess[] | undefined,
): string | null => {
  if (!partnerAccesses) return null;
  return partnerAccesses
    .map((pa) => {
      if (pa.featureLiveChat) return pa.partner.name;
    })
    .join(', ');
};

export const joinedFeatureTherapy = (
  partnerAccesses: PartnerAccess[] | undefined,
): string | null => {
  if (!partnerAccesses) return null;
  return partnerAccesses
    .map((pa) => {
      if (pa.featureTherapy) return pa.partner.name;
    })
    .join(', ');
};

export const totalTherapyRemaining = (partnerAccesses: PartnerAccess[] | undefined): number => {
  if (!partnerAccesses) return 0;
  return partnerAccesses.reduce(function (total, pa) {
    // return the sum with previous value
    return total + pa.therapySessionsRemaining;
  }, 0);
};

export const totalTherapyRedeemed = (partnerAccesses: PartnerAccess[] | undefined): number => {
  if (!partnerAccesses) return 0;
  return partnerAccesses.reduce(function (total, pa) {
    // return the sum with previous value
    return total + pa.therapySessionsRedeemed;
  }, 0);
};
