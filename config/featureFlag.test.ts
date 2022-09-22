import { FeatureFlag } from './featureFlag';

const disabledCourse1 = 'fr/courses/healing-from-sexual-trauma/';
const disabledCourse2 = 'fr/courses/dating-boundaries-and-relationships/';

describe('featureFlag', () => {
  it('should return disabled courses when environment variable set', () => {
    process.env.FF_DISABLED_COURSES = [disabledCourse1, disabledCourse2].join(',');

    expect(FeatureFlag.getDisabledCourses()).toContain(disabledCourse1);
    expect(FeatureFlag.getDisabledCourses()).toContain(disabledCourse2);
  });

  it('should return empty array when environment variable not', () => {
    process.env.FF_DISABLED_COURSES = '';

    expect(FeatureFlag.getDisabledCourses().length).toEqual(0);
  });
});
