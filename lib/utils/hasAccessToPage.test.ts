import { PartnerContent } from '@/lib/constants/partners';
import { PartnerAccess } from '@/lib/store/partnerAccessSlice';
import { PartnerAdmin } from '@/lib/store/partnerAdminSlice';
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
  describe('if page is available prelogin', () => {
    it('a user with no referall partner should have access to a public page', () => {
      expect(hasAccessToPage(false, true, ['Public'], [], emptyPartnerAdmin)).to.equal(true);
    });
    it('a user with a referral partner should not have access to public only page', () => {
      expect(hasAccessToPage(false, true, ['Public'], [], emptyPartnerAdmin, 'Bumble')).to.equal(
        false,
      );
    });
    it('a user with referral partner should have access to a partner page', () => {
      expect(hasAccessToPage(false, true, ['Bumble'], [], emptyPartnerAdmin, 'Bumble')).to.equal(
        true,
      );
    });
    it('a partner user with referral partner should have access to a partner and public page', () => {
      expect(
        hasAccessToPage(false, true, ['Bumble', 'Public'], [], emptyPartnerAdmin, 'Bumble'),
      ).to.equal(true);
    });
    it('a public user should have access to a partner and public page', () => {
      expect(hasAccessToPage(false, true, ['Bumble', 'Public'], [], emptyPartnerAdmin)).to.equal(
        true,
      );
    });
  });
  describe('if a page is available after login', () => {
    describe('if courses are for public users only', () => {
      it('a public user should have access', () => {
        expect(hasAccessToPage(true, false, ['Public'], [], emptyPartnerAdmin)).to.equal(true);
      });
      it('a partner user should not have access', () => {
        expect(
          hasAccessToPage(true, false, ['Public'], [partnerAccess], emptyPartnerAdmin),
        ).to.equal(false);
      });
      it('a public user with partner referall should have access', () => {
        expect(hasAccessToPage(true, false, ['Public'], [], emptyPartnerAdmin, 'Bumble')).to.equal(
          true,
        );
      });
    });
    describe('if courses are for partner users only', () => {
      it('a public user should not have access', () => {
        expect(hasAccessToPage(true, false, ['Bumble'], [], emptyPartnerAdmin)).to.equal(false);
      });
      it('a public user with a referral partner should not have access', () => {
        expect(hasAccessToPage(true, false, ['Bumble'], [], emptyPartnerAdmin, 'bumble')).to.equal(
          false,
        );
      });
      it('a partner user should have access', () => {
        expect(
          hasAccessToPage(true, false, ['Bumble'], [partnerAccess], emptyPartnerAdmin),
        ).to.equal(true);
      });
      it('a partner admin for partner should have access', () => {
        expect(hasAccessToPage(true, false, ['Bumble'], [partnerAccess], partnerAdmin)).to.equal(
          true,
        );
      });
    });
    describe('if courses are for partner and public users', () => {
      it('a public user should have access', () => {
        expect(hasAccessToPage(true, false, ['Bumble', 'Public'], [], emptyPartnerAdmin)).to.equal(
          true,
        );
      });
      it('a partner user should have access', () => {
        expect(
          hasAccessToPage(true, false, ['Bumble', 'Public'], [partnerAccess], emptyPartnerAdmin),
        ).to.equal(true);
      });
    });
  });
});
