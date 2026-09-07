import { PartnerContent } from '@/lib/constants/partners';
import { PartnerAccess } from '@/lib/store/partnerAccessSlice';
import { PartnerAdmin } from '@/lib/store/partnerAdminSlice';
import { expect } from '@jest/globals';
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
  describe('logged-out visitor', () => {
    it('a user with no referral partner has access to a public page', () => {
      expect(hasAccessToPage(false, ['Public'], [], emptyPartnerAdmin)).toEqual(true);
    });
    it('a user with a referral partner does not have access to a public-only page', () => {
      expect(hasAccessToPage(false, ['Public'], [], emptyPartnerAdmin, 'Bumble')).toEqual(false);
    });
    it('a user with a referral partner has access to that partner page', () => {
      expect(hasAccessToPage(false, ['Bumble'], [], emptyPartnerAdmin, 'Bumble')).toEqual(true);
    });
    it('the referral partner match is case-insensitive', () => {
      expect(hasAccessToPage(false, ['Bumble'], [], emptyPartnerAdmin, 'bumble')).toEqual(true);
    });
    it('a user with a referral partner has access to a partner-and-public page', () => {
      expect(hasAccessToPage(false, ['Bumble', 'Public'], [], emptyPartnerAdmin, 'Bumble')).toEqual(
        true,
      );
    });
    it('a public user has access to a partner-and-public page', () => {
      expect(hasAccessToPage(false, ['Bumble', 'Public'], [], emptyPartnerAdmin)).toEqual(true);
    });
    it('a public user does not have access to a partner-only page', () => {
      expect(hasAccessToPage(false, ['Bumble'], [], emptyPartnerAdmin)).toEqual(false);
    });
  });

  describe('logged-in visitor', () => {
    describe('page is for public users only', () => {
      it('a public user has access', () => {
        expect(hasAccessToPage(true, ['Public'], [], emptyPartnerAdmin)).toEqual(true);
      });
      it('a partner user does not have access', () => {
        expect(hasAccessToPage(true, ['Public'], [partnerAccess], emptyPartnerAdmin)).toEqual(
          false,
        );
      });
      it('a public user with a lingering partner referral still accesses public content', () => {
        // A referral partner is only a pre-login hint; once logged in it must not strip access to
        // 'Public' content. Regression test for a course overview wrongly showing "no access" after
        // entry via a partner UTM link (which leaves a referralPartner cookie set).
        expect(hasAccessToPage(true, ['Public'], [], emptyPartnerAdmin, 'Bumble')).toEqual(true);
      });
    });
    describe('page is for partner users only', () => {
      it('a partner user has access', () => {
        expect(hasAccessToPage(true, ['Bumble'], [partnerAccess], emptyPartnerAdmin)).toEqual(true);
      });
      it('a partner admin for that partner has access', () => {
        expect(hasAccessToPage(true, ['Bumble'], [partnerAccess], partnerAdmin)).toEqual(true);
      });
    });
    describe('page is for partner and public users', () => {
      it('a public user has access', () => {
        expect(hasAccessToPage(true, ['Bumble', 'Public'], [], emptyPartnerAdmin)).toEqual(true);
      });
      it('a partner user has access', () => {
        expect(
          hasAccessToPage(true, ['Bumble', 'Public'], [partnerAccess], emptyPartnerAdmin),
        ).toEqual(true);
      });
    });
  });

  // A referral partner must only ever *add* access (letting a logged-out visitor preview their
  // partner's content) and never *remove* access an equivalent user would otherwise have. These
  // cover the four user states for a course included for everyone (all partners + 'Public'), which
  // a lingering referral cookie previously broke for logged-in public users on a partner deep-link.
  describe('referral partner only adds access, never removes it', () => {
    const allPartnersIncludingPublic = ['Public', 'Bumble', 'Badoo'];

    it('1. logged out with no referral can preview public content', () => {
      expect(hasAccessToPage(false, allPartnersIncludingPublic, [], emptyPartnerAdmin)).toEqual(
        true,
      );
    });
    it('2. logged out with a referral partner can preview that content', () => {
      expect(
        hasAccessToPage(false, allPartnersIncludingPublic, [], emptyPartnerAdmin, 'badoo'),
      ).toEqual(true);
    });
    it('3. logged in with no partner access still gets public content despite a referral cookie', () => {
      expect(
        hasAccessToPage(true, allPartnersIncludingPublic, [], emptyPartnerAdmin, 'badoo'),
      ).toEqual(true);
    });
    it('4. logged in with a partner access gets access despite a referral cookie', () => {
      const badooAccess = {
        ...partnerAccess,
        partner: { name: 'Badoo' } as PartnerContent,
      } as PartnerAccess;
      expect(
        hasAccessToPage(
          true,
          allPartnersIncludingPublic,
          [badooAccess],
          emptyPartnerAdmin,
          'badoo',
        ),
      ).toEqual(true);
    });
    it('a referral cookie does not grant a logged-in user access to an unrelated partner course', () => {
      expect(hasAccessToPage(true, ['Bumble'], [], emptyPartnerAdmin, 'badoo')).toEqual(false);
    });
  });
});
