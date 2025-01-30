import { PartnerAccesses } from '@/lib/store/partnerAccessSlice';
import { PartnerAdmin } from '@/lib/store/partnerAdminSlice';

export enum AccountType {
  partnerAdmin = 'PARTNER_ADMIN',
  superAdmin = 'SUPER_ADMIN',
  publicUser = 'PUBLIC_USER',
  partnerUser = 'PARTNER_USER',
}
export const getAccountType = (
  partnerAdmin: PartnerAdmin | undefined,
  partnerAccesses: PartnerAccesses | undefined,
): AccountType => {
  if (partnerAdmin?.id) {
    return AccountType.partnerAdmin;
  }
  if (partnerAccesses && partnerAccesses.length > 0) {
    return AccountType.partnerUser;
  }
  return AccountType.publicUser;
};
