import { Course } from '../app/coursesSlice';
import { PROGRESS_STATUS } from '../constants/enums';

export const determineCourseProgress = (courses: Course[], courseId: number) => {
  const userCourse = courses.find((course: Course) => course.storyblokId === courseId);

  let progress = PROGRESS_STATUS.NOT_STARTED;

  if (userCourse) {
    progress = userCourse.completed ? PROGRESS_STATUS.COMPLETED : PROGRESS_STATUS.STARTED;
  }
  return progress;
};
