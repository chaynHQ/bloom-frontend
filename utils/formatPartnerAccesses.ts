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
    .filter((pa) => pa.featureLiveChat)
    .map((pa) => pa.partner.name)
    .join(', ');
};

export const joinedFeatureTherapy = (
  partnerAccesses: PartnerAccess[] | undefined,
): string | null => {
  if (!partnerAccesses) return null;

  return partnerAccesses
    .filter((pa) => pa.featureTherapy)
    .map((pa) => pa.partner.name)
    .join(', ');
};

export const totalTherapyRemaining = (
  partnerAccesses: PartnerAccess[] | undefined,
): number | null => {
  if (!partnerAccesses) return null;

  return partnerAccesses.reduce(function (total, pa) {
    // return the sum with previous value
    return total + pa.therapySessionsRemaining;
  }, 0);
};

export const totalTherapyRedeemed = (
  partnerAccesses: PartnerAccess[] | undefined,
): number | null => {
  if (!partnerAccesses) return null;

  return partnerAccesses.reduce(function (total, pa) {
    // return the sum with previous value
    return total + pa.therapySessionsRedeemed;
  }, 0);
};
