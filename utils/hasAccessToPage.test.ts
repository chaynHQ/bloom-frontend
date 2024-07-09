import { PartnerAccess } from '../app/partnerAccessSlice';
import { PartnerAdmin } from '../app/partnerAdminSlice';
import { PartnerContent } from '../constants/partners';
import hasAccessToPage from './hasAccessToPage';

const emptyPartnerAdmin: PartnerAdmin = {
  partner: null,
  id: null,
  active: null,
  createdAt: null,
  updatedAt: null,
};
const partnerAdmin: PartnerAdmin = {
  partner: { name: 'Bumble' } as PartnerContent,
  id: null,
  active: null,
  createdAt: null,
  updatedAt: null,
};
const partnerAccess = {
  id: '1',
  createdAt: new Date(),
  updatedAt: new Date(),
  partner: { name: 'Bumble' } as PartnerContent,
} as PartnerAccess;

describe('hasAccessToPage', () => {
  describe('if courses are for public users only', () => {
    it('a public user should have access', () => {
      expect(hasAccessToPage(['Public'], [], emptyPartnerAdmin)).toEqual(true);
    });
    it('a partner user should not have access', () => {
      expect(hasAccessToPage(['Public'], [partnerAccess], emptyPartnerAdmin)).toEqual(false);
    });
  });
  describe('if courses are for partner users only', () => {
    it('a public user should not have access', () => {
      expect(hasAccessToPage(['Bumble'], [], emptyPartnerAdmin)).toEqual(false);
    });
    it('a partner user should have access', () => {
      expect(hasAccessToPage(['Bumble'], [partnerAccess], emptyPartnerAdmin)).toEqual(true);
    });
    it('a partner admin for partner should have access', () => {
      expect(hasAccessToPage(['Bumble'], [partnerAccess], partnerAdmin)).toEqual(true);
    });
  });
  describe('if courses are for partner and public users', () => {
    it('a public user should have access', () => {
      expect(hasAccessToPage(['Bumble', 'Public'], [], emptyPartnerAdmin)).toEqual(true);
    });
    it('a partner user should have access', () => {
      expect(hasAccessToPage(['Bumble', 'Public'], [partnerAccess], emptyPartnerAdmin)).toEqual(
        true,
      );
    });
  });
});
