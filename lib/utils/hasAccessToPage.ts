import { PartnerAccesses } from '@/lib/store/partnerAccessSlice';
import { PartnerAdmin } from '@/lib/store/partnerAdminSlice';

export default function hasAccessToPage(
  loggedIn: boolean,
  availableForPreviewOrPreLogin: boolean,
  partnersWithAccess: Array<string>,
  partnerAccesses: PartnerAccesses,
  partnerAdmin: PartnerAdmin,
  referralPartner?: string | null,
): boolean {
  if (!availableForPreviewOrPreLogin && !loggedIn) {
    return false;
  }

  const isPublicUser = !partnerAccesses.length && !partnerAdmin.id && !referralPartner;

  if (isPublicUser) {
    if (partnersWithAccess.includes('Public')) {
      return true;
    }
    return false;
  }

  if (!loggedIn) {
    const referralPartnerCapitalized =
      referralPartner && referralPartner?.charAt(0).toUpperCase() + referralPartner?.slice(1);
    return !!referralPartnerCapitalized && partnersWithAccess.includes(referralPartnerCapitalized);
  }

  if (partnerAdmin.partner?.name && partnersWithAccess.includes(partnerAdmin.partner.name)) {
    return true;
  }

  return partnerAccesses.some((partnerAccess) =>
    partnersWithAccess.includes(partnerAccess.partner.name),
  );
}
