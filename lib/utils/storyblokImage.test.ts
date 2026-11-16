import { expect } from '@jest/globals';
import { isRemoteSvg, storyblokImageSize } from './storyblokImage';

const logo = 'https://a.storyblok.com/f/123/320x96/abc123/bumble_logo.svg';

describe('storyblokImageSize', () => {
  it('reads the size from a Storyblok asset path', () => {
    expect(storyblokImageSize(logo)).toEqual({ width: 320, height: 96 });
  });

  it('is undefined for a static import or another URL', () => {
    expect(storyblokImageSize({ src: '/x.svg', width: 1, height: 1 })).toBeUndefined();
    expect(storyblokImageSize('https://example.com/x.png')).toBeUndefined();
  });
});

describe('isRemoteSvg', () => {
  it('is true only for an SVG URL', () => {
    expect(isRemoteSvg(logo)).toBe(true);
    expect(isRemoteSvg('https://a.storyblok.com/f/123/320x96/abc/logo.png')).toBe(false);
    expect(isRemoteSvg({ src: '/x.svg', width: 1, height: 1 })).toBe(false);
  });
});
