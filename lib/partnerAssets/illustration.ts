import { clampChroma, formatHex, oklch } from 'culori';
import fs from 'fs';
import path from 'path';

// The lightness floor keeps the black line art at AAA contrast on any hue.
export const MIN_LIGHTNESS = 0.82;
export const MAX_LIGHTNESS = 0.93;
export const MAX_CHROMA = 0.15;

const CIRCLE_FILL = '.cls-2{fill:#f6c651;}';

export function pastel(brandColor: string) {
  const color = oklch(brandColor);
  if (!color) throw new Error(`The partner's brand_color "${brandColor}" isn't a colour`);

  const clamped = {
    ...color,
    l: Math.min(Math.max(color.l, MIN_LIGHTNESS), MAX_LIGHTNESS),
    c: Math.min(color.c, MAX_CHROMA),
  };
  return formatHex(clampChroma(clamped, 'oklch'));
}

export function renderIllustration(brandColor: string) {
  const template = fs.readFileSync(
    path.join(process.cwd(), 'public/illustration_bloom_head_yellow.svg'),
    'utf8',
  );
  if (!template.includes(CIRCLE_FILL)) {
    throw new Error('The illustration template no longer has its yellow circle');
  }
  return template.replace(CIRCLE_FILL, `.cls-2{fill:${pastel(brandColor)};}`);
}
