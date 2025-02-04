import { PartnerAccess } from '@/lib/store/partnerAccessSlice';
import { PartnerAdmin } from '@/lib/store/partnerAdminSlice';

export const joinedPartners = (
  partnerAccesses: PartnerAccess[] | undefined,
  partnerAdmin: PartnerAdmin | undefined,
): string | null => {
  if (!partnerAccesses && !partnerAdmin) return null;

  const partnerAdminName = partnerAdmin?.partner?.name;
  const partnerAccessNames = partnerAccesses?.map((pa) => pa.partner.name).sort();

  const partnerArray = [
    ...(partnerAdminName ? [partnerAdminName] : []),
    ...(partnerAccessNames ? partnerAccessNames : []),
  ]
    .filter((element, index, array) => array.indexOf(element) === index) // ensures array is unique
    .sort()
    .join(', ');

  return partnerArray.length > 0 ? partnerArray : null;
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
