import { PartnerAccess, PartnerAccesses } from '../app/partnerAccessSlice';
import { PartnerAdmin } from '../app/partnerAdminSlice';
import { AccountType, getAccountType } from './getAccountType';
const partnerAdmin = {} as PartnerAdmin;
const partnerAccesses = [{} as PartnerAccess] as PartnerAccesses;

describe('getAccountType', () => {
  it('should return publicUser if neither is partnerAdmin nor partner user', () => {
    expect(getAccountType(undefined, undefined)).toBe(AccountType.publicUser);
  });
  it('should return partnerAdmin if is partnerAdmin', () => {
    expect(getAccountType(partnerAdmin, undefined)).toBe(AccountType.partnerAdmin);
  });
  it('should return partnerUser if not partnerAdmin and connected to partner', () => {
    expect(getAccountType(undefined, partnerAccesses)).toBe(AccountType.partnerUser);
  });
  it('should return partnerAdmin  if both partnerAdmin and connected to partner', () => {
    expect(getAccountType(partnerAdmin, partnerAccesses)).toBe(AccountType.partnerAdmin);
  });
});
