/**
 * @jest-environment node
 */
import { Resvg } from '@resvg/resvg-js';
import { LOGO_MAX_HEIGHT, lockupLayout, measureLogo, renderLockup } from './lockup';

const svg = (width: number, height: number, body: string) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`,
  );

// The proportions of Bumble's logo, which the old lockup scaled to 398×70 under a 400-wide wordmark.
const bumbleSize = { width: 1062, height: 187 };

describe('lockupLayout', () => {
  it('matches the old Bumble lockup: wordmark, line of text, then the logo at full width', () => {
    const layout = lockupLayout(bumbleSize, 322);

    expect(layout.width).toBe(400);
    expect(layout.height).toBe(232);
    expect(layout.wordmark).toEqual({ x: 0, y: 0, width: 400, height: expect.closeTo(68.4, 1) });
    expect(layout.text).toEqual({ x: 200, y: 129, fontSize: 40 });
    expect(layout.logo.x).toBe(0);
    expect(layout.logo.y).toBe(161);
    expect(layout.logo.width).toBe(400);
    expect(layout.logo.height).toBeCloseTo(70.4, 1);
  });

  it('keeps a very wide logo at the wordmark width', () => {
    const layout = lockupLayout({ width: 2000, height: 100 }, 322);

    expect(layout.logo).toEqual({ x: 0, y: 161, width: 400, height: 20 });
    expect(layout.height).toBe(181);
  });

  it('caps a square logo’s height and centres it', () => {
    const layout = lockupLayout({ width: 512, height: 512 }, 322);

    expect(layout.logo).toEqual({
      x: (400 - LOGO_MAX_HEIGHT) / 2,
      y: 161,
      width: LOGO_MAX_HEIGHT,
      height: LOGO_MAX_HEIGHT,
    });
    expect(layout.height).toBe(161 + LOGO_MAX_HEIGHT);
  });

  it('shrinks text wider than the wordmark to fit it, and leaves shorter text alone', () => {
    expect(lockupLayout(bumbleSize, 500).text.fontSize).toBe(32);
    expect(lockupLayout(bumbleSize, 400).text.fontSize).toBe(40);
    expect(lockupLayout(bumbleSize, 250).text.fontSize).toBe(40);
  });
});

describe('measureLogo', () => {
  const padded = svg(1000, 400, '<rect x="250" y="150" width="500" height="100" fill="#333"/>');

  it('crops an SVG logo to its ink', () => {
    const { crop } = measureLogo(padded);

    expect(crop.x).toBeCloseTo(250, -1);
    expect(crop.y).toBeCloseTo(150, -1);
    expect(crop.width).toBeCloseTo(500, -1);
    expect(crop.height).toBeCloseTo(100, -1);
  });

  it('crops a transparent PNG logo to its ink', () => {
    const png = Buffer.from(new Resvg(padded).render().asPng());
    const { crop } = measureLogo(png);

    expect(crop.width / crop.height).toBeCloseTo(5, 1);
  });

  it('rejects a logo that is neither SVG nor PNG, or has nothing visible', () => {
    expect(() => measureLogo(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toThrow('SVG or PNG');
    expect(() => measureLogo(svg(100, 100, ''))).toThrow('nothing visible');
  });
});

describe('renderLockup', () => {
  it('renders a PNG at 3×', () => {
    const logo = svg(bumbleSize.width, bumbleSize.height, '<rect width="1062" height="187"/>');
    const { png, width, height } = renderLockup(logo, 'In partnership with');

    expect(png.subarray(1, 4).toString()).toBe('PNG');
    expect({ width, height }).toEqual({ width: 1200, height: 696 });
  });
});
