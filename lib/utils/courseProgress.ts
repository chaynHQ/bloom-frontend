import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { Course } from '@/lib/store/coursesSlice';

export const determineCourseProgress = (courses: Course[], courseUuid: string) => {
  const userCourse = courses.find((course: Course) => course.storyblokUuid === courseUuid);

  let progress = PROGRESS_STATUS.NOT_STARTED;

  if (userCourse) {
    progress = userCourse.completed ? PROGRESS_STATUS.COMPLETED : PROGRESS_STATUS.STARTED;
  }
  return progress;
};
