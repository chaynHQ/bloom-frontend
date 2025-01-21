import { PartnerContent } from '../constants/partners';
import { PartnerAccess } from '../lib/store/partnerAccessSlice';

const userHasAccessToPartnerContent = (
  partnerAdminPartner: PartnerContent | null,
  partnerAccesses: PartnerAccess[],
  referralPartner: string | null,
  userId: string | null,
): string[] => {
  let accessPartners: string[] = [];
  if (partnerAdminPartner) {
    accessPartners.push(partnerAdminPartner.name.toLowerCase());
  }
  if (userId && partnerAccesses && partnerAccesses.length > 0) {
    partnerAccesses.forEach((partnerAccess) => {
      accessPartners.push(partnerAccess.partner.name.toLowerCase());
    });
  }
  if (referralPartner && !userId) {
    accessPartners.push(referralPartner.toLowerCase());
  }
  if (
    (!userId && !referralPartner) ||
    (userId && partnerAccesses.length === 0 && !partnerAdminPartner)
  ) {
    accessPartners.push('public');
  }
  return accessPartners.filter((partner, index, partners) => {
    return partners.indexOf(partner) === index;
  });
};

export default userHasAccessToPartnerContent;
