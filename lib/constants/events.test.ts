import { expect } from '@jest/globals';
import {
  generatePartnerPromoGetStartedEvent,
  generatePartnerPromoGoToCoursesEvent,
  generatePartnershipPromoLogoClick,
} from './events';

describe('per-partner event names', () => {
  it('are unchanged for Bumble and Badoo', () => {
    expect(generatePartnerPromoGetStartedEvent('bumble')).toBe('BUMBLE_PROMO_GET_STARTED_CLICKED');
    expect(generatePartnerPromoGoToCoursesEvent('badoo')).toBe('BADOO_PROMO_GO_TO_COURSES_CLICKED');
    expect(generatePartnershipPromoLogoClick('bumble')).toBe(
      'PARTNERSHIP_PROMO_BUMBLE_LOGO_CLICKED',
    );
  });

  it('turn hyphens in a slug into underscores', () => {
    expect(generatePartnerPromoGetStartedEvent('test-partner')).toBe(
      'TEST_PARTNER_PROMO_GET_STARTED_CLICKED',
    );
    expect(generatePartnerPromoGoToCoursesEvent('test-partner-plus')).toBe(
      'TEST_PARTNER_PLUS_PROMO_GO_TO_COURSES_CLICKED',
    );
    expect(generatePartnershipPromoLogoClick('test-partner')).toBe(
      'PARTNERSHIP_PROMO_TEST_PARTNER_LOGO_CLICKED',
    );
  });
});
