import { PartnerAccesses } from '../app/partnerAccessSlice';
import { PartnerAdmin } from '../app/partnerAdminSlice';

const hasAccessToPage = (
  partnersWithAccess: Array<string>,
  partnerAccesses: PartnerAccesses,
  partnerAdmin: PartnerAdmin,
) => {
  const isPublicUser = (partnerAccesses !== null && partnerAccesses.length) === 0;
  if (isPublicUser && partnersWithAccess.includes('Public')) {
    return true;
  }
  if (partnerAdmin.partner?.name && partnersWithAccess.includes(partnerAdmin.partner?.name)) {
    return true;
  }
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
  return isPartnerUserWithAccess || false;
};

export default hasAccessToPage;
