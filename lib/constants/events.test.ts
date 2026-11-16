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
    expect(generatePartnerPromoGetStartedEvent('bumble-for-friends')).toBe(
      'BUMBLE_FOR_FRIENDS_PROMO_GET_STARTED_CLICKED',
    );
    expect(generatePartnerPromoGoToCoursesEvent('bumble-for-friends')).toBe(
      'BUMBLE_FOR_FRIENDS_PROMO_GO_TO_COURSES_CLICKED',
    );
    expect(generatePartnershipPromoLogoClick('bumble-for-friends')).toBe(
      'PARTNERSHIP_PROMO_BUMBLE_FOR_FRIENDS_LOGO_CLICKED',
    );
  });
});
