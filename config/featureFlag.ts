export namespace FeatureFlag {
  export const getDisabledCourses: () => Set<string> = () => {
    const disabledCourses: string[] = [];

    const disabledCoursesString = process.env.FF_DISABLED_COURSES;
    if (disabledCoursesString) disabledCourses.push(...disabledCoursesString.split(','));

    return new Set<string>(disabledCourses);
  };

  export const isUserResearchBannerEnabled = () => {
    return Boolean(process.env.NEXT_PUBLIC_FF_USER_RESEARCH_BANNER);
  };
}
