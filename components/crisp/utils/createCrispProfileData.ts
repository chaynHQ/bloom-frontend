import { Course } from '../../../app/coursesSlice';
import { PartnerAccesses } from '../../../app/partnerAccessSlice';
import { PROGRESS_STATUS } from '../../../constants/enums';

export const getAcronym = (text: string) => {
  return `${text
    .split(/\s/)
    .reduce((response, word) => (response += word.slice(0, 1)), '')
    .toLowerCase()}`;
};

export const formatCourseKey = (courseName: string) => {
  return `course_${getAcronym(courseName)}_status`;
};

export const formatSessionKey = (courseName: string, status: PROGRESS_STATUS) => {
  return `course_${getAcronym(courseName)}_sessions_${status.toLowerCase()}`;
};

export const createCrispProfileData = (
  partnerAccesses: PartnerAccesses,
  course: Course[],
): [string, string | boolean | number][] => {
  const partners: [string, string] = [
    'partners',
    partnerAccesses.map((pa) => pa.partner.name).join('; ') || '',
  ];
  const featureLiveChat: [string, boolean] = [
    'feature_live_chat',
    partnerAccesses.length > 0 ? !!partnerAccesses.find((pa) => pa.featureLiveChat) : true,
  ];
  const featureTherapy: [string, boolean] = [
    'feature_therapy',
    !!partnerAccesses.find((pa) => pa.featureTherapy),
  ];
  const featureTherapySessionsRemaining: [string, number] = [
    'therapy_sessions_remaining',
    partnerAccesses.map((pa) => pa.therapySessionsRemaining).reduce((a, b) => a + b, 0),
  ];
  const featureTherapySessionsRedeemed: [string, number] = [
    'therapy_sessions_redeemed',
    partnerAccesses.map((pa) => pa.therapySessionsRedeemed).reduce((a, b) => a + b, 0),
  ];

  const courseData = course.reduce<[string, string][]>((formattedCourses, course) => {
    const sessions = course.sessions;
    const courseKey = formatCourseKey(course.name);
    const courseStatus: [string, string] = [
      courseKey,
      course.completed ? PROGRESS_STATUS.COMPLETED : PROGRESS_STATUS.STARTED,
    ];
    const sessionsStartedKey = formatSessionKey(course.name, PROGRESS_STATUS.STARTED);
    const sessionsStarted: [string, string] = [
      sessionsStartedKey,
      sessions
        .filter((session) => !session.completed)
        .map((s) => s.name)
        .join('; '),
    ];
    const sessionsCompletedKey = formatSessionKey(course.name, PROGRESS_STATUS.COMPLETED);
    const sessionsCompleted: [string, string] = [
      sessionsCompletedKey,
      sessions
        .filter((session) => !!session.completed)
        .map((session) => session.name)
        .join('; '),
    ];

    return [...formattedCourses, courseStatus, sessionsStarted, sessionsCompleted];
  }, []);

  return [
    partners,
    featureLiveChat,
    featureTherapy,
    featureTherapySessionsRemaining,
    featureTherapySessionsRedeemed,
    ...courseData,
  ];
};
