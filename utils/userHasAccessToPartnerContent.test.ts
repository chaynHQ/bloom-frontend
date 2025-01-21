import { PartnerContent } from '../constants/partners';
import { PartnerAccesses } from '../lib/store/partnerAccessSlice';
import userHasAccessToPartnerContent from './userHasAccessToPartnerContent';

const partnerAPartnerAccessCode = {
  id: '1',
  createdAt: new Date(),
  updatedAt: new Date(),
  partner: { name: 'PartnerA' } as PartnerContent,
};
const partnerBPartnerAccessCode = {
  id: 'w',
  createdAt: new Date(),
  updatedAt: new Date(),
  partner: { name: 'PartnerB' } as PartnerContent,
};
const partnerAPartner = { name: 'PartnerA' } as PartnerContent;

describe('userHasAccessToPartnerContent', () => {
  describe('when user is logged out', () => {
    it('and has no referral partners', () => {
      // Arrange
      const partnerAdminPartner = null;
      const partnerAccesses: PartnerAccesses = [];
      const referralPartner = null;
      const userId = null;

      // Act
      const result = userHasAccessToPartnerContent(
        partnerAdminPartner,
        partnerAccesses,
        referralPartner,
        userId,
      );

      // Assert
      expect(result).toEqual(['public']);
    });
    it('and has PartnerA referral partner', () => {
      // Arrange
      const partnerAdminPartner = null;
      const partnerAccesses: PartnerAccesses = [];
      const referralPartner = 'PartnerA';
      const userId = null;

      // Act
      const result = userHasAccessToPartnerContent(
        partnerAdminPartner,
        partnerAccesses,
        referralPartner,
        userId,
      );

      // Assert
      expect(result).toEqual(['partnera']);
    });
  });

  describe('when user is logged in', () => {
    it('and has no referral partners', () => {
      // Arrange
      const partnerAdminPartner = null;
      const partnerAccesses: PartnerAccesses = [];
      const referralPartner = null;
      const userId = 'userID';

      // Act
      const result = userHasAccessToPartnerContent(
        partnerAdminPartner,
        partnerAccesses,
        referralPartner,
        userId,
      );

      // Assert
      expect(result).toEqual(['public']);
    });
    it('and has PartnerA referral partner but no access code', () => {
      // Arrange
      const partnerAdminPartner = null;
      const partnerAccesses: PartnerAccesses = [];
      const referralPartner = 'partnerA';
      const userId = 'abc123';

      // Act
      const result = userHasAccessToPartnerContent(
        partnerAdminPartner,
        partnerAccesses,
        referralPartner,
        userId,
      );

      // Assert
      expect(result).toEqual(['public']);
    });
    it('and has no referral partner but has a PartnerA access code', () => {
      // Arrange
      const partnerAdminPartner = null;
      const partnerAccesses = [partnerAPartnerAccessCode] as PartnerAccesses;
      const referralPartner = null;
      const userId = '1234';

      // Act
      const result = userHasAccessToPartnerContent(
        partnerAdminPartner,
        partnerAccesses,
        referralPartner,
        userId,
      );

      // Assert
      expect(result).toEqual(['partnera']);
    });
    it('and has no referral partner but has a PartnerA access code and is partnerAdmin', () => {
      // Arrange
      const partnerAdminPartner = partnerAPartner;
      const partnerAccesses = [partnerAPartnerAccessCode] as PartnerAccesses;

      const referralPartner = null;
      const userId = '12345';

      // Act
      const result = userHasAccessToPartnerContent(
        partnerAdminPartner,
        partnerAccesses,
        referralPartner,
        userId,
      );

      // Assert
      expect(result).toEqual(['partnera']);
    });
    it('and has no referral partner but has a PartnerA access code and is partnerAdmin', () => {
      // Arrange
      const partnerAdminPartner = partnerAPartner;
      const partnerAccesses = [partnerAPartnerAccessCode] as PartnerAccesses;

      const referralPartner = null;
      const userId = '12345';

      // Act
      const result = userHasAccessToPartnerContent(
        partnerAdminPartner,
        partnerAccesses,
        referralPartner,
        userId,
      );

      // Assert
      expect(result).toEqual(['partnera']);
    });
    it('and has no referral partner but has a PartnerA and PartnerB access code', () => {
      // Arrange
      const partnerAdminPartner = partnerAPartner;
      const partnerAccesses = [
        partnerAPartnerAccessCode,
        partnerBPartnerAccessCode,
      ] as PartnerAccesses;

      const referralPartner = null;
      const userId = '12345';

      // Act
      const result = userHasAccessToPartnerContent(
        partnerAdminPartner,
        partnerAccesses,
        referralPartner,
        userId,
      );

      // Assert
      expect(result).toEqual(['partnera', 'partnerb']);
    });
  });
});
