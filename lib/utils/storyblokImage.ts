import type { StaticImageData } from 'next/image';

const STORYBLOK_ASSET_SIZE = /^https:\/\/a\.storyblok\.com\/f\/\d+\/(\d+)x(\d+)\//;

// next/image needs a remote image's size, which Storyblok keeps in the asset path.
export function storyblokImageSize(src: string | StaticImageData) {
  const size = typeof src === 'string' ? src.match(STORYBLOK_ASSET_SIZE) : null;
  return size ? { width: Number(size[1]), height: Number(size[2]) } : undefined;
}

// The image optimiser rejects remote SVGs, so they are served as they are.
export function isRemoteSvg(src: string | StaticImageData) {
  return typeof src === 'string' && /\.svg$/i.test(src);
}
