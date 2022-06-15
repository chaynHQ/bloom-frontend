import { PartnerAccesses } from '../app/partnerAccessSlice';
import { PartnerAdmin } from '../app/partnerAdminSlice';

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
  // TODO We do not have the data for whether someone is a super admin yet
  // this would be great to implement
  if (partnerAdmin?.id) {
    return AccountType.partnerAdmin;
  }
  if (partnerAccesses && partnerAccesses.length > 0) {
    return AccountType.partnerUser;
  }
  return AccountType.publicUser;
};
