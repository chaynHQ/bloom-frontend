import { FeatureFlag } from './featureFlag';

const disabledCourse1 = 'fr/courses/healing-from-sexual-trauma/';
const disabledCourse2 = 'fr/courses/dating-boundaries-and-relationships/';

describe('featureFlag', () => {
  it('should return disabled courses when environment variable set', () => {
    process.env.FF_DISABLED_COURSES = [disabledCourse1, disabledCourse2].join(',');

    expect(Array.from(FeatureFlag.getDisabledCourses())).toContain(disabledCourse1);
    expect(Array.from(FeatureFlag.getDisabledCourses())).toContain(disabledCourse2);
  });

  it('should return empty array when environment variable not', () => {
    process.env.FF_DISABLED_COURSES = '';

    expect(FeatureFlag.getDisabledCourses().size).toEqual(0);
  });

  it('should return user research banner value when environment variable set', () => {
    process.env.FF_USER_RESEARCH_BANNER = 'true';

    expect(FeatureFlag.isUserResearchBannerEnabled()).toEqual(true);
  });

  it('should return false when user research banner environment variable is not set', () => {
    process.env.FF_USER_RESEARCH_BANNER = '';

    expect(FeatureFlag.isUserResearchBannerEnabled()).toEqual(false);
  });
});
