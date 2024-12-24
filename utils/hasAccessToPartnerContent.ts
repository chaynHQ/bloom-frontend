import { PartnerContent } from '../constants/partners';
import { PartnerAccess } from '../store/partnerAccessSlice';

export const userHasAccessToPartnerContent = (
  partnerAdminPartner: PartnerContent | null,
  partnerAccesses: PartnerAccess[],
  referallPartner: string | null,
  userId: string | null,
): string[] => {
  if (partnerAdminPartner) {
    return [partnerAdminPartner.name];
  } else if (partnerAccesses && partnerAccesses.length > 0) {
    return partnerAccesses.map((partnerAccess) => {
      return partnerAccess.partner.name;
    });
  } else if (referallPartner && !userId) {
    return [referallPartner];
  } else {
    return ['Public'];
  }
};
