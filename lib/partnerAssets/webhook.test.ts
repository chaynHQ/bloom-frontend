/**
 * @jest-environment node
 */
import { serverInstance as rollbar } from '@/lib/rollbar';
import { generatePartnerAssets } from './generate';
import { generatePartnerAssetsSafely, publishedPartnerStoryId } from './webhook';

let mockEnvironment = 'production';
jest.mock('@/lib/constants/common', () => ({
  ...jest.requireActual('@/lib/constants/common'),
  get ENVIRONMENT() {
    return mockEnvironment;
  },
}));
jest.mock('@/lib/rollbar', () => ({
  serverInstance: { error: jest.fn(), wait: jest.fn((done: () => void) => done()) },
}));
jest.mock('./generate', () => ({ generatePartnerAssets: jest.fn() }));

const generate = generatePartnerAssets as jest.Mock;
const webhook = (payload: object) => JSON.stringify({ text: 'x', space_id: 142459, ...payload });

describe('publishedPartnerStoryId', () => {
  it('returns the story id when a partner story is published', () => {
    expect(
      publishedPartnerStoryId(
        webhook({ action: 'published', story_id: 2, full_slug: 'partners/bff' }),
      ),
    ).toBe(2);
  });

  it('ignores other actions, other stories and bodies that aren’t a story webhook', () => {
    const partner = { story_id: 1, full_slug: 'partners/bumble' };
    expect(publishedPartnerStoryId(webhook({ ...partner, action: 'unpublished' }))).toBeNull();
    expect(publishedPartnerStoryId(webhook({ ...partner, action: 'deleted' }))).toBeNull();
    expect(
      publishedPartnerStoryId(
        webhook({ action: 'published', story_id: 3, full_slug: 'welcome/bumble' }),
      ),
    ).toBeNull();
    expect(
      publishedPartnerStoryId(webhook({ action: 'published', full_slug: 'partners/bumble' })),
    ).toBeNull();
    expect(publishedPartnerStoryId('not json')).toBeNull();
    expect(publishedPartnerStoryId('null')).toBeNull();
  });
});

describe('generatePartnerAssetsSafely', () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEnvironment = 'production';
    process.env.STORYBLOK_OAUTH_TOKEN = 'mapi-token';
    process.env.STORYBLOK_SPACE_ID = '142459';
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => warn.mockRestore());

  it('generates in production and locally', async () => {
    for (const environment of ['production', 'development']) {
      mockEnvironment = environment;
      await generatePartnerAssetsSafely(1);
    }
    expect(generate).toHaveBeenCalledTimes(2);
    expect(generate).toHaveBeenCalledWith(1);
  });

  it('never generates on staging, which shares the Storyblok space and its webhooks', async () => {
    mockEnvironment = 'staging';

    await generatePartnerAssetsSafely(1);

    expect(generate).not.toHaveBeenCalled();
  });

  it('skips without a management token or space id, and says so once', async () => {
    delete process.env.STORYBLOK_OAUTH_TOKEN;
    await generatePartnerAssetsSafely(1);
    await generatePartnerAssetsSafely(2);

    process.env.STORYBLOK_OAUTH_TOKEN = 'mapi-token';
    delete process.env.STORYBLOK_SPACE_ID;
    await generatePartnerAssetsSafely(3);

    expect(generate).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(/STORYBLOK_OAUTH_TOKEN.*STORYBLOK_SPACE_ID/);
  });

  it('logs a generation error to Rollbar instead of throwing', async () => {
    const error = new Error('Storyblok POST /assets → 422');
    generate.mockRejectedValueOnce(error);

    await expect(generatePartnerAssetsSafely(1)).resolves.toBeUndefined();

    expect(rollbar.error).toHaveBeenCalledWith(
      'Partner asset generation failed for story 1',
      error,
    );
    expect(rollbar.wait).toHaveBeenCalled();
  });

  it('catches an error thrown before generation starts', async () => {
    generate.mockImplementationOnce(() => {
      throw new Error('boom');
    });

    await expect(generatePartnerAssetsSafely(1)).resolves.toBeUndefined();
    expect(rollbar.error).toHaveBeenCalled();
  });
});
