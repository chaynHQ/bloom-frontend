import { PartnerAccess, PartnerAccesses } from '@/lib/store/partnerAccessSlice';
import { PartnerAdmin } from '@/lib/store/partnerAdminSlice';
import { expect } from '@jest/globals';
import { AccountType, getAccountType } from './getAccountType';
const partnerAdminEmpty = { id: null } as PartnerAdmin;
const partnerAdmin = { id: 'id' } as PartnerAdmin;

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
  it('should return publicUser if partnerAdmi id = null', () => {
    expect(getAccountType(partnerAdminEmpty, undefined)).toBe(AccountType.publicUser);
  });
});
