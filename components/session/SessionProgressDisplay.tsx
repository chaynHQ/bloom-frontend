'use client';

import { useGetUserCoursesQuery } from '@/lib/api';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { useTypedSelector } from '@/lib/hooks/store';
import { Course } from '@/lib/store/coursesSlice';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import { Box } from '@mui/material';
import { useMemo } from 'react';

interface SessionProgressDisplayProps {
  sessionId: string;
  storyblokCourseUuid: string;
}

export const SessionProgressDisplay = (props: SessionProgressDisplayProps) => {
  const { sessionId, storyblokCourseUuid } = props;
  const isLoggedIn = useTypedSelector((state) => Boolean(state.user.id));

  const courses = useTypedSelector((state) => state.courses);

  useGetUserCoursesQuery(undefined, { skip: !isLoggedIn });

  const sessionProgress = useMemo(() => {
    const userCourse = courses?.find(
      (course: Course) => course.storyblokUuid === storyblokCourseUuid,
    );

    if (userCourse) {
      const matchingSession = userCourse.sessions?.find(
        (userSession) => userSession.storyblokUuid === sessionId,
      );

      if (matchingSession) {
        return matchingSession.completed ? PROGRESS_STATUS.COMPLETED : PROGRESS_STATUS.STARTED;
      }
    }
    return PROGRESS_STATUS.NOT_STARTED;
  }, [courses, sessionId, storyblokCourseUuid]);

  return (
    <>
      {sessionProgress !== PROGRESS_STATUS.NOT_STARTED && (
        <Box mt={0.5}>
          {sessionProgress === PROGRESS_STATUS.STARTED && <DonutLargeIcon color="error" />}
          {sessionProgress === PROGRESS_STATUS.COMPLETED && <CheckCircleIcon color="error" />}
        </Box>
      )}
    </>
  );
};
