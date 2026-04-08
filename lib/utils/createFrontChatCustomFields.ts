import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { Course } from '@/lib/store/coursesSlice';
import { PartnerAccesses } from '@/lib/store/partnerAccessSlice';

const getAcronym = (text: string) => {
  return `${text
    .split(/\s/)
    .reduce((response, word) => (response += word.slice(0, 1)), '')
    .toLowerCase()}`;
};

const formatCourseKey = (courseName: string) => {
  return `course_${getAcronym(courseName)}_status`;
};

const formatSessionKey = (courseName: string, status: PROGRESS_STATUS) => {
  return `course_${getAcronym(courseName)}_sessions_${status.toLowerCase()}`;
};

export const createFrontChatCustomFields = (
  partnerAccesses: PartnerAccesses,
  courses: Course[],
): Record<string, string | boolean | number> => {
  const fields: Record<string, string | boolean | number> = {
    partners: partnerAccesses.map((pa) => pa.partner.name).join('; ') || '',
    feature_live_chat:
      partnerAccesses.length > 0 ? !!partnerAccesses.find((pa) => pa.featureLiveChat) : true,
    feature_therapy: !!partnerAccesses.find((pa) => pa.featureTherapy),
    therapy_sessions_remaining: partnerAccesses
      .map((pa) => pa.therapySessionsRemaining)
      .reduce((a, b) => a + b, 0),
    therapy_sessions_redeemed: partnerAccesses
      .map((pa) => pa.therapySessionsRedeemed)
      .reduce((a, b) => a + b, 0),
  };

  courses.forEach((course) => {
    const sessions = course.sessions;
    fields[formatCourseKey(course.name)] = course.completed
      ? PROGRESS_STATUS.COMPLETED
      : PROGRESS_STATUS.STARTED;
    fields[formatSessionKey(course.name, PROGRESS_STATUS.STARTED)] = sessions
      .filter((session) => !session.completed)
      .map((s) => s.name)
      .join('; ');
    fields[formatSessionKey(course.name, PROGRESS_STATUS.COMPLETED)] = sessions
      .filter((session) => !!session.completed)
      .map((session) => session.name)
      .join('; ');
  });

  return fields;
};
