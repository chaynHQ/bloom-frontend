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

  // A referral partner is a pre-login marketing hint (set from welcome/register paths or a partner
  // name in UTM link data). It must never reduce the access of an authenticated user, whose real
  // entitlements come from their partner accesses / admin role below. Ignoring it once logged in
  // stops a lingering referral cookie (e.g. from a UTM deep-link) from pushing a logged-in user
  // with no partner access out of the public audience and hiding 'Public' content from them.
  const effectiveReferralPartner = loggedIn ? undefined : referralPartner;

  const isPublicUser = !partnerAccesses.length && !partnerAdmin.id && !effectiveReferralPartner;

  if (isPublicUser) {
    return partnersWithAccess.includes('Public');
  }

  if (!loggedIn) {
    const referralPartnerCapitalized =
      effectiveReferralPartner &&
      effectiveReferralPartner.charAt(0).toUpperCase() + effectiveReferralPartner.slice(1);
    return !!referralPartnerCapitalized && partnersWithAccess.includes(referralPartnerCapitalized);
  }

  if (partnerAdmin.partner?.name && partnersWithAccess.includes(partnerAdmin.partner.name)) {
    return true;
  }

  return partnerAccesses.some((partnerAccess) =>
    partnersWithAccess.includes(partnerAccess.partner.name),
  );
}
