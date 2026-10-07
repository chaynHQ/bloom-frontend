jest.mock('@/components/storyblok/StoryblokAccordion', () => () => null);
jest.mock('@/components/storyblok/StoryblokAudio', () => () => null);
jest.mock('@/components/storyblok/StoryblokAvatarGroup', () => () => null);
jest.mock('@/components/storyblok/StoryblokButton', () => () => null);
jest.mock('@/components/storyblok/StoryblokCard', () => () => null);
jest.mock('@/components/storyblok/StoryblokCarousel', () => () => null);
jest.mock('@/components/storyblok/StoryblokImage', () => () => null);
jest.mock('@/components/storyblok/StoryblokLinkCard', () => () => null);
jest.mock('@/components/storyblok/StoryblokQuote', () => () => null);
jest.mock('@/components/storyblok/StoryblokQuoteCard', () => () => null);
jest.mock('@/components/storyblok/StoryblokResourceCarousel', () => () => null);
jest.mock('@/components/storyblok/StoryblokRow', () => () => null);
jest.mock('@/components/storyblok/StoryblokRowColumnBlock', () => () => null);
jest.mock('@/components/storyblok/StoryblokSpacer', () => () => null);
jest.mock('@/components/storyblok/StoryblokStatement', () => () => null);
jest.mock('@/components/storyblok/StoryblokTeamMemberCard', () => () => null);
jest.mock('@/components/storyblok/StoryblokTeamMembersCards', () => () => null);
jest.mock('@/components/storyblok/StoryblokVideo', () => () => null);
jest.mock('@/i18n/routing', () => ({ Link: () => null }));
jest.mock('gemoji', () => ({ nameToEmoji: {} }));

import { render as renderDom } from '@testing-library/react';
import { render } from 'storyblok-rich-text-react-renderer';
import { RichTextOptions } from './richText';

const listItem = (text: string) => ({
  type: 'list_item',
  content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
});

describe('RichTextOptions ordered lists', () => {
  it('resumes numbering from the list’s `order` attribute', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'ordered_list', attrs: { order: 1 }, content: [listItem('first')] },
        { type: 'paragraph', content: [{ type: 'text', text: 'between' }] },
        { type: 'ordered_list', attrs: { order: 2 }, content: [listItem('second')] },
      ],
    };
    const { container } = renderDom(<>{render(doc, RichTextOptions)}</>);
    const lists = container.querySelectorAll('ol');

    expect(lists).toHaveLength(2);
    expect(lists[0].hasAttribute('start')).toBe(false);
    expect(lists[1].getAttribute('start')).toBe('2');
  });
});
