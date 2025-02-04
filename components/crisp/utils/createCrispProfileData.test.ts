import { Course, Session } from '@/lib/store/coursesSlice';
import { PartnerAccess } from '@/lib/store/partnerAccessSlice';
import { expect } from '@jest/globals';
import { createCrispProfileData } from './createCrispProfileData';

const storyblokPublished = 'published';

const partnerAccess = {
  featureLiveChat: true,
  featureTherapy: true,
  therapySessionsRedeemed: 5,
  therapySessionsRemaining: 5,
  id: 'string',
  accessCode: '123456',
  partner: { name: 'partner' },
} as PartnerAccess;

const course = {
  id: 'c1',
  name: 'Course 1',
  status: storyblokPublished,
  completed: false,
  sessions: [
    {
      completed: false,
      name: 'Session 1',
      id: 's1',
      slug: 'slug',
      storyblokId: 1,
      status: storyblokPublished,
    } as Session,
    {
      completed: true,
      name: 'Session 2',
      id: 's2',
      slug: 'slug',
      storyblokId: 2,
      status: storyblokPublished,
    },
    {
      completed: false,
      name: 'Session 3',
      id: 's3',
      slug: 'slug',
      storyblokId: 3,
      status: storyblokPublished,
    },
  ],
} as Course;

describe('createCrispProfileData', () => {
  describe('createCrispProfileData should return correctly ', () => {
    it('when supplied with user with no partneraccess , it should return correctly', () => {
      expect(createCrispProfileData([], [])).toEqual([
        ['partners', ''],
        ['feature_live_chat', true],
        ['feature_therapy', false],
        ['therapy_sessions_remaining', 0],
        ['therapy_sessions_redeemed', 0],
      ]);
    });
    it('when supplied with user with two partneraccess , it should return correctly', () => {
      expect(createCrispProfileData([partnerAccess, partnerAccess], [])).toEqual([
        ['partners', 'partner; partner'],
        ['feature_live_chat', true],
        ['feature_therapy', true],
        ['therapy_sessions_remaining', 10],
        ['therapy_sessions_redeemed', 10],
      ]);
    });
    it('when supplied with user with a course , it should return correctly', () => {
      expect(createCrispProfileData([], [course])).toEqual([
        ['partners', ''],
        ['feature_live_chat', true],
        ['feature_therapy', false],
        ['therapy_sessions_remaining', 0],
        ['therapy_sessions_redeemed', 0],
        ['course_c1_status', 'Started'],
        ['course_c1_sessions_started', 'Session 1; Session 3'],
        ['course_c1_sessions_completed', 'Session 2'],
      ]);
    });
  });
});
