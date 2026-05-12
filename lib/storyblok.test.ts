import { expect, jest, describe, it, beforeEach } from '@jest/globals';

jest.mock('@/components/storyblok/StoryblokAccordion', () => () => null);
jest.mock('@/components/storyblok/StoryblokAudio', () => () => null);
jest.mock('@/components/storyblok/StoryblokButton', () => () => null);
jest.mock('@/components/storyblok/StoryblokCard', () => () => null);
jest.mock('@/components/storyblok/StoryblokCarousel', () => () => null);
jest.mock('@/components/storyblok/StoryblokCoursePage', () => () => null);
jest.mock('@/components/storyblok/StoryblokImage', () => () => null);
jest.mock('@/components/storyblok/StoryblokMeetTheTeamPage', () => () => null);
jest.mock('@/components/storyblok/StoryblokNotesFromBloomPromo', () => () => null);
jest.mock('@/components/storyblok/StoryblokPage', () => () => null);
jest.mock('@/components/storyblok/StoryblokPageSection', () => () => null);
jest.mock('@/components/storyblok/StoryblokQuote', () => () => null);
jest.mock('@/components/storyblok/StoryblokResourceCarousel', () => () => null);
jest.mock('@/components/storyblok/StoryblokRow', () => () => null);
jest.mock('@/components/storyblok/StoryblokRowColumnBlock', () => () => null);
jest.mock('@/components/storyblok/StoryblokSessionPage', () => () => null);
jest.mock('@/components/storyblok/StoryblokSpacer', () => () => null);
jest.mock('@/components/storyblok/StoryblokStatement', () => () => null);
jest.mock('@/components/storyblok/StoryblokTeamMemberCard', () => () => null);
jest.mock('@/components/storyblok/StoryblokTeamMembersCards', () => () => null);
jest.mock('@/components/storyblok/StoryblokVideo', () => () => null);
jest.mock('@/components/storyblok/StoryblokWelcomePage', () => () => null);

const mockGet = jest.fn();

jest.mock('@storyblok/react/rsc', () => ({
  apiPlugin: {},
  storyblokInit: () => () => ({
    get: mockGet,
  }),
}));

jest.mock('./rollbar', () => ({
  serverInstance: {
    error: jest.fn(),
  },
}));

jest.mock('@/lib/utils/logEvent', () => ({
  logEvent: jest.fn(),
}));

jest.mock('@vercel/analytics/react', () => ({
  track: jest.fn(),
}));

jest.mock('@next/third-parties/google', () => ({
  sendGAEvent: jest.fn(),
}));

jest.mock('@/lib/api', () => ({}));
jest.mock('@/lib/auth', () => ({}));
jest.mock('@/lib/constants/partners', () => ({}));
jest.mock('next-intl/navigation', () => ({}));
jest.mock('next-intl/routing', () => ({}));
jest.mock('@/i18n/routing', () => ({}));
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));
jest.mock('gemoji', () => ({}));

import { getStoryblokStory, getStoryblokStories } from './storyblok';
import { serverInstance as rollbar } from './rollbar';

describe('storyblok utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStoryblokStory', () => {
    it('should log an error to Rollbar if fetching the story fails', async () => {
      const testError = new Error('Fetch failed');
      mockGet.mockRejectedValueOnce(testError as never);

      const result = await getStoryblokStory('test-slug', 'en');

      expect(result).toBeUndefined();
      expect(rollbar.error).toHaveBeenCalledWith(
        'Error getting storyblok data for page',
        testError,
        expect.objectContaining({ slug: 'test-slug' }),
      );
    });

    it('should return the story data if fetching succeeds', async () => {
      const testStory = { name: 'test' };
      mockGet.mockResolvedValueOnce({ data: { story: testStory } } as never);

      const result = await getStoryblokStory('test-slug', 'en');

      expect(result).toEqual(testStory);
      expect(rollbar.error).not.toHaveBeenCalled();
    });

    it('should throw an error if no slug and no uuids are provided', async () => {
      await expect(getStoryblokStory(undefined, 'en')).rejects.toThrow('No slug provided');
    });
  });

  describe('getStoryblokStories', () => {
    it('should log an error to Rollbar if fetching stories fails', async () => {
      const testError = new Error('Fetch failed');
      mockGet.mockRejectedValueOnce(testError as never);

      await getStoryblokStories('en', {});

      expect(rollbar.error).toHaveBeenCalledWith(
        'Error getting storyblok data for page',
        testError,
        expect.any(Object),
      );
    });

    it('should return stories data if fetching succeeds', async () => {
      const testStories = [{ name: 'test1' }, { name: 'test2' }];
      mockGet.mockResolvedValueOnce({ data: { stories: testStories } } as never);

      const result = await getStoryblokStories('en', {});

      expect(result).toEqual(testStories);
      expect(rollbar.error).not.toHaveBeenCalled();
    });
  });
});
