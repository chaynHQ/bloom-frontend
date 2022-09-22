export namespace FeatureFlag {
  export const getDisabledCourses = () => {
    const disabledCourses: string[] = [];

    const disabledCoursesString = process.env.FF_DISABLED_COURSES;
    if (disabledCoursesString) disabledCourses.push(...disabledCoursesString.split(','));

    return disabledCourses;
  };
}
