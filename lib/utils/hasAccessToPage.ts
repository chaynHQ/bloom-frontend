import { PartnerAccesses } from '@/lib/store/partnerAccessSlice';
import { PartnerAdmin } from '@/lib/store/partnerAdminSlice';

const hasAccessToPage = (
  loggedIn: boolean,
  availablePreLogin: boolean,
  partnersWithAccess: Array<string>,
  partnerAccesses: PartnerAccesses,
  partnerAdmin: PartnerAdmin,
  referralPartner?: string | null,
) => {
  // if page is available prelogin

  if (availablePreLogin && !loggedIn) {
    // if available to bumble and has referal partner in local storage return true
    const referralPartnerCapitalized =
      referralPartner && referralPartner?.charAt(0).toUpperCase() + referralPartner?.slice(1);
    if (referralPartnerCapitalized && partnersWithAccess.includes(referralPartnerCapitalized)) {
      return true;
    }
    // if available to general public and has no referral partner in local storage return true
    if (partnersWithAccess.includes('Public') && !referralPartner) {
      return true;
    }
    return false;
  }
  if (!availablePreLogin && !loggedIn) {
    return false;
  }

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
