import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { Courses, Session } from '@/lib/store/coursesSlice';
import { ISbStoryData } from '@storyblok/react/rsc';

export interface SessionCompletionResult {
  sessionProgress: PROGRESS_STATUS;
  sessionId: string | undefined;
}

export const getSessionCompletion = (
  course: ISbStoryData,
  courses: Courses,
  storyblokUuid: string,
): SessionCompletionResult => {
  const userCourse = courses.find((c: any) => c.storyblokUuid === course.uuid);

  if (userCourse) {
    const userSession = userCourse.sessions.find(
      (session: Session) => session.storyblokUuid === storyblokUuid,
    );

    if (userSession) {
      return {
        sessionId: userSession.id,
        sessionProgress: userSession.completed
          ? PROGRESS_STATUS.COMPLETED
          : PROGRESS_STATUS.STARTED,
      };
    }
  }

  return {
    sessionProgress: PROGRESS_STATUS.NOT_STARTED,
    sessionId: undefined,
  };
};
