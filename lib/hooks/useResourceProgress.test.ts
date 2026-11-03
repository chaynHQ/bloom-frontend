import { act, renderHook } from '@testing-library/react';
import { useCompleteResourceMutation, useStartResourceMutation } from '@/lib/api';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { COURSE_COMPLETED, COURSE_STARTED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent from '@/lib/utils/logEvent';
import { useResourceProgress } from './useResourceProgress';

jest.mock('@/lib/api', () => ({
  useStartResourceMutation: jest.fn(),
  useCompleteResourceMutation: jest.fn(),
}));
jest.mock('@/lib/hooks/store', () => ({ useTypedSelector: jest.fn() }));
jest.mock('@/lib/utils/logEvent', () => jest.fn());
jest.mock('@rollbar/react', () => ({ useRollbar: () => ({ error: jest.fn() }) }));

const startResource = jest.fn();
const completeResource = jest.fn();

const render = (args: Partial<Parameters<typeof useResourceProgress>[0]> = {}) =>
  renderHook(() =>
    useResourceProgress({
      storyUuid: 'resource',
      eventPrefix: 'RESOURCE_VIDEO',
      resourceProgress: PROGRESS_STATUS.NOT_STARTED,
      eventData: {},
      ...args,
    }),
  ).result.current;

beforeEach(() => {
  jest.clearAllMocks();
  (useTypedSelector as unknown as jest.Mock).mockImplementation((selector) =>
    selector({ user: { id: 'user-1' } }),
  );
  (useStartResourceMutation as jest.Mock).mockReturnValue([startResource]);
  (useCompleteResourceMutation as jest.Mock).mockReturnValue([completeResource]);
  startResource.mockResolvedValue({ data: { storyblokUuid: 'resource' } });
  completeResource.mockResolvedValue({ data: { storyblokUuid: 'resource' } });
});

describe('useResourceProgress', () => {
  it('starts a new resource without a course outside a course', async () => {
    const { start } = render();
    await act(() => start());

    expect(startResource).toHaveBeenCalledWith({ storyblokUuid: 'resource' });
  });

  it('does not restart a resource already started outside a course', async () => {
    const { start } = render({ resourceProgress: PROGRESS_STATUS.COMPLETED });
    await act(() => start());

    expect(startResource).not.toHaveBeenCalled();
  });

  it('starts the course for a resource done elsewhere, without logging a resource start', async () => {
    const { start } = render({
      resourceProgress: PROGRESS_STATUS.COMPLETED,
      courseStoryblokUuid: 'course',
    });
    await act(() => start());
    await act(() => start());

    expect(startResource).toHaveBeenCalledTimes(1);
    expect(startResource).toHaveBeenCalledWith({
      storyblokUuid: 'resource',
      courseStoryblokUuid: 'course',
    });
    expect(logEvent).not.toHaveBeenCalledWith('RESOURCE_VIDEO_STARTED_REQUEST', expect.anything());
  });

  it('does nothing extra once the course is started', async () => {
    const { start } = render({
      resourceProgress: PROGRESS_STATUS.STARTED,
      courseStoryblokUuid: 'course',
      courseStarted: true,
    });
    await act(() => start());

    expect(startResource).not.toHaveBeenCalled();
  });

  it('logs the course events the backend reports', async () => {
    startResource.mockResolvedValue({
      data: {
        storyblokUuid: 'resource',
        courseProgress: [
          { storyblokUuid: 'course', name: 'Course', started: true, completed: false },
        ],
      },
    });
    completeResource.mockResolvedValue({
      data: {
        storyblokUuid: 'resource',
        courseProgress: [
          { storyblokUuid: 'course', name: 'Course', started: false, completed: true },
        ],
      },
    });

    const { start, complete } = render({ courseStoryblokUuid: 'course' });
    await act(() => start());
    await act(async () => {
      await complete();
    });

    expect(logEvent).toHaveBeenCalledWith(
      COURSE_STARTED,
      expect.objectContaining({ course_trigger: 'course_resource', course_name: 'Course' }),
    );
    expect(logEvent).toHaveBeenCalledWith(
      COURSE_COMPLETED,
      expect.objectContaining({ course_trigger: 'course_resource' }),
    );
    expect(completeResource).toHaveBeenCalledWith({
      storyblokUuid: 'resource',
      courseStoryblokUuid: 'course',
    });
  });

  it('tags a completion outside a course as standalone', async () => {
    completeResource.mockResolvedValue({
      data: {
        storyblokUuid: 'resource',
        courseProgress: [
          { storyblokUuid: 'course', name: 'Course', started: false, completed: true },
        ],
      },
    });

    const { complete } = render();
    await act(async () => {
      await complete();
    });

    expect(completeResource).toHaveBeenCalledWith({ storyblokUuid: 'resource' });
    expect(logEvent).toHaveBeenCalledWith(
      COURSE_COMPLETED,
      expect.objectContaining({ course_trigger: 'standalone' }),
    );
  });
});
