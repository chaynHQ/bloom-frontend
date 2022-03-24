export const courseIsLiveSoon = (course: any): boolean => {
  return course.live_start_date &&
    (Date.parse(course.live_start_date) > Date.now() ||
      (Date.parse(course.live_end_date) > Date.now() && course.coming_soon)) && // catch for late release
    course.live_soon_content
    ? true
    : false;
};

export const courseIsLiveNow = (course: any): boolean => {
  return !course.coming_soon && // catch for late release
    course.live_start_date &&
    Date.parse(course.live_start_date) < Date.now() &&
    Date.parse(course.live_end_date) > Date.now() &&
    course.live_now_content
    ? true
    : false;
};
