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

  it('upper-cases the slug', () => {
    expect(generatePartnerPromoGetStartedEvent('bff')).toBe('BFF_PROMO_GET_STARTED_CLICKED');
    expect(generatePartnerPromoGoToCoursesEvent('bff')).toBe('BFF_PROMO_GO_TO_COURSES_CLICKED');
    expect(generatePartnershipPromoLogoClick('bff')).toBe('PARTNERSHIP_PROMO_BFF_LOGO_CLICKED');
  });

  // Today's slugs have no hyphens; a future one might.
  it('turns hyphens in a slug into underscores', () => {
    expect(generatePartnerPromoGetStartedEvent('two-words')).toBe(
      'TWO_WORDS_PROMO_GET_STARTED_CLICKED',
    );
  });
});
