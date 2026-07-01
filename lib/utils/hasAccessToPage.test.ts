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
  describe('if page is available prelogin', () => {
    it('a user with no referall partner should have access to a public page', () => {
      expect(hasAccessToPage(false, true, ['Public'], [], emptyPartnerAdmin)).toEqual(true);
    });
    it('a user with a referral partner should not have access to public only page', () => {
      expect(hasAccessToPage(false, true, ['Public'], [], emptyPartnerAdmin, 'Bumble')).toEqual(
        false,
      );
    });
    it('a user with referral partner should have access to a partner page', () => {
      expect(hasAccessToPage(false, true, ['Bumble'], [], emptyPartnerAdmin, 'Bumble')).toEqual(
        true,
      );
    });
    it('a partner user with referral partner should have access to a partner and public page', () => {
      expect(
        hasAccessToPage(false, true, ['Bumble', 'Public'], [], emptyPartnerAdmin, 'Bumble'),
      ).toEqual(true);
    });
    it('a public user should have access to a partner and public page', () => {
      expect(hasAccessToPage(false, true, ['Bumble', 'Public'], [], emptyPartnerAdmin)).toEqual(
        true,
      );
    });
  });
  describe('if a page is available after login', () => {
    describe('if courses are for public users only', () => {
      it('a public user should have access', () => {
        expect(hasAccessToPage(true, false, ['Public'], [], emptyPartnerAdmin)).toEqual(true);
      });
      it('a partner user should not have access', () => {
        expect(
          hasAccessToPage(true, false, ['Public'], [partnerAccess], emptyPartnerAdmin),
        ).toEqual(false);
      });
      it('a logged-in public user with a lingering partner referral should still access public content', () => {
        // A referral partner is only a pre-login hint; once logged in it must not strip access to
        // 'Public' content. Regression test for course overview wrongly showing "no access" after
        // entering via a partner UTM link (which leaves a referralPartner cookie set).
        expect(hasAccessToPage(true, false, ['Public'], [], emptyPartnerAdmin, 'Bumble')).toEqual(
          true,
        );
      });
    });
    describe('if courses are for partner users only', () => {
      it('a public user should not have access', () => {
        expect(hasAccessToPage(true, false, ['Bumble'], [], emptyPartnerAdmin)).toEqual(false);
      });
      it('a public user with a referral partner should have access', () => {
        expect(hasAccessToPage(false, true, ['Bumble'], [], emptyPartnerAdmin, 'bumble')).toEqual(
          true,
        );
      });
      it('a partner user should have access', () => {
        expect(
          hasAccessToPage(true, false, ['Bumble'], [partnerAccess], emptyPartnerAdmin),
        ).toEqual(true);
      });
      it('a partner admin for partner should have access', () => {
        expect(hasAccessToPage(true, false, ['Bumble'], [partnerAccess], partnerAdmin)).toEqual(
          true,
        );
      });
    });
    describe('if courses are for partner and public users', () => {
      it('a public user should have access', () => {
        expect(hasAccessToPage(true, false, ['Bumble', 'Public'], [], emptyPartnerAdmin)).toEqual(
          true,
        );
      });
      it('a partner user should have access', () => {
        expect(
          hasAccessToPage(true, false, ['Bumble', 'Public'], [partnerAccess], emptyPartnerAdmin),
        ).toEqual(true);
      });
    });
  });

  // A referral partner is a pre-login marketing hint set from UTM link data / welcome paths.
  // It must only ever *add* access (letting a logged-out visitor preview their partner's content)
  // and must never *remove* access an equivalent user would otherwise have. These cover the four
  // user states for a course included for everyone (all partners + 'Public'), which a lingering
  // referral cookie previously broke for logged-in public users on a partner deep-link.
  describe('referral partner only adds access, never removes it', () => {
    const allPartnersIncludingPublic = ['Public', 'Bumble', 'Badoo'];

    it('1. logged out with no referral can preview public content', () => {
      expect(
        hasAccessToPage(false, true, allPartnersIncludingPublic, [], emptyPartnerAdmin),
      ).toEqual(true);
    });
    it('2. logged out with a referral partner can preview that content', () => {
      expect(
        hasAccessToPage(false, true, allPartnersIncludingPublic, [], emptyPartnerAdmin, 'badoo'),
      ).toEqual(true);
    });
    it('3. logged in with no partner access still gets public content despite a referral cookie', () => {
      expect(
        hasAccessToPage(true, true, allPartnersIncludingPublic, [], emptyPartnerAdmin, 'badoo'),
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
          true,
          allPartnersIncludingPublic,
          [badooAccess],
          emptyPartnerAdmin,
          'badoo',
        ),
      ).toEqual(true);
    });
    it('a referral cookie does not grant a logged-in user access to an unrelated partner course', () => {
      // referral=badoo must not let a public logged-in user into a Bumble-only course.
      expect(hasAccessToPage(true, true, ['Bumble'], [], emptyPartnerAdmin, 'badoo')).toEqual(
        false,
      );
    });
  });
});
