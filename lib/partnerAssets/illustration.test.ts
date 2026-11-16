/**
 * @jest-environment node
 */
import { differenceEuclidean, oklch, wcagContrast } from 'culori';
import fs from 'fs';
import path from 'path';
import {
  MAX_CHROMA,
  MAX_LIGHTNESS,
  MIN_LIGHTNESS,
  pastel,
  renderIllustration,
} from './illustration';

const template = fs.readFileSync(
  path.join(process.cwd(), 'public/illustration_bloom_head_yellow.svg'),
  'utf8',
);
const distance = differenceEuclidean('oklch');
const hueOf = (hex: string) => oklch(hex)!.h ?? 0;
const hueGap = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

const vivid = ['#e063ff', '#ff0000', '#0000ff', '#00a651', '#ff6a00', '#7b2cbf'];
const dark = ['#000000', '#1a0033', '#3b1d0a', '#0b2545'];
const light = ['#ffffff', '#fff9db', '#f0f8ff'];

describe('pastel', () => {
  it('keeps Bumble’s and Badoo’s colours, which are already the pastels their illustrations use', () => {
    expect(distance(pastel('#f6c651'), '#f6c651')).toBeLessThan(0.01);
    expect(distance(pastel('#e9d8ff'), '#e9d8ff')).toBeLessThan(0.01);
  });

  it.each([...vivid, ...dark, ...light])(
    'clamps %s’s lightness and chroma and keeps its hue',
    (color) => {
      const result = oklch(pastel(color))!;

      expect(result.l).toBeGreaterThanOrEqual(MIN_LIGHTNESS - 0.005);
      expect(result.l).toBeLessThanOrEqual(MAX_LIGHTNESS + 0.005);
      expect(result.c).toBeLessThanOrEqual(MAX_CHROMA + 0.005);
      if (oklch(color)!.c > 0.03)
        expect(hueGap(hueOf(pastel(color)), hueOf(color))).toBeLessThan(3);
    },
  );

  it('keeps the black line art at AAA contrast for any hue', () => {
    for (let hue = 0; hue < 360; hue += 10) {
      for (const [l, c] of [
        [0.3, 0.3],
        [0.6, 0.2],
        [0.95, 0.02],
      ]) {
        const color = pastel(`oklch(${l} ${c} ${hue})`);
        expect(wcagContrast(color, '#000000')).toBeGreaterThanOrEqual(7);
      }
    }
  });

  it('rejects anything that isn’t a colour', () => {
    expect(() => pastel('not a colour')).toThrow('brand_color');
  });
});

describe('renderIllustration', () => {
  it('replaces only the circle’s fill', () => {
    const svg = renderIllustration('#e063ff');

    expect(svg).toContain(`.cls-2{fill:${pastel('#e063ff')};}`);
    expect(svg.replace(pastel('#e063ff'), '#f6c651')).toBe(template);
  });
});
