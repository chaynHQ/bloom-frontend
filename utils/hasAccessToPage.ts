import { PartnerAccesses } from '../store/partnerAccessSlice';
import { PartnerAdmin } from '../store/partnerAdminSlice';

const hasAccessToPage = (
  partnersWithAccess: Array<string>,
  partnerAccesses: PartnerAccesses,
  partnerAdmin: PartnerAdmin,
) => {
  const isPublicUser = (partnerAccesses !== null && partnerAccesses.length) === 0;
  // determine if public user has access
  if (isPublicUser && partnersWithAccess.includes('Public')) {
    return true;
  }
  // determine if partner admin has access
  if (partnerAdmin.partner?.name && partnersWithAccess.includes(partnerAdmin.partner?.name)) {
    return true;
  }
  // determine if partner user has access
  const isPartnerUserWithAccess = partnerAccesses.reduce<boolean>(
    (hasAccessAlready, partnerAccess) => {
      if (hasAccessAlready) return hasAccessAlready;
      if (partnersWithAccess.includes(partnerAccess.partner.name)) {
        return true;
      }
      return false;
    },
    false,
  );
  return isPartnerUserWithAccess;
};

export default hasAccessToPage;
