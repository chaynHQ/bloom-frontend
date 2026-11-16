import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';

type Size = { width: number; height: number };
type Box = Size & { x: number; y: number };

// In the units of the old hand-made lockup (public/bloom_bumble_logo.svg): a 400-wide wordmark,
// the line of text, then the partner's logo at the wordmark's width.
const WIDTH = 400;
const WORDMARK = { width: 415, height: 71 };
const TEXT_SIZE = 40;
const TEXT_BASELINE = 129;
const LOGO_TOP = 161;
// At full width a square or tall logo would tower over the wordmark.
export const LOGO_MAX_HEIGHT = 120;
const SCALE = 3;
// Long side, in pixels, of the render used to find a logo's ink.
const MEASURE_SIZE = 1000;

const fontOptions = {
  fontFiles: [path.join(process.cwd(), 'lib/partnerAssets/fonts/OpenSans-LightItalic.ttf')],
  loadSystemFonts: false,
  defaultFontFamily: 'Open Sans',
};

export function lockupLayout(logo: Size, textWidth: number) {
  const fullWidthHeight = (WIDTH * logo.height) / logo.width;
  const height = Math.min(fullWidthHeight, LOGO_MAX_HEIGHT);
  const width = height === fullWidthHeight ? WIDTH : (height * logo.width) / logo.height;

  return {
    width: WIDTH,
    height: Math.ceil(LOGO_TOP + height),
    wordmark: { x: 0, y: 0, width: WIDTH, height: (WIDTH * WORDMARK.height) / WORDMARK.width },
    text: {
      x: WIDTH / 2,
      y: TEXT_BASELINE,
      fontSize: textWidth > WIDTH ? (TEXT_SIZE * WIDTH) / textWidth : TEXT_SIZE,
    },
    logo: { x: (WIDTH - width) / 2, y: LOGO_TOP, width, height },
  };
}

const svgDocument = (size: Size, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}" viewBox="0 0 ${size.width} ${size.height}">${body}</svg>`;

const image = (box: Box, href: string) =>
  `<image x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" href="${href}"/>`;

const dataUri = (type: string, file: Buffer) => `data:${type};base64,${file.toString('base64')}`;

const escapeXml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function inkBounds(pixels: Buffer, width: number, height: number) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] > 8) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }
  return maxX < 0 ? null : { x: minX, y: minY, width: maxX + 1 - minX, height: maxY + 1 - minY };
}

const isPng = (file: Buffer) => file.subarray(1, 4).toString('latin1') === 'PNG';

// Logos often come with padding around them, which would shrink them in the lockup, so each is
// cropped to its visible ink.
export function measureLogo(logo: Buffer) {
  let href: string;
  let size: Size;
  if (isPng(logo)) {
    href = dataUri('image/png', logo);
    size = { width: logo.readUInt32BE(16), height: logo.readUInt32BE(20) };
  } else if (logo.toString('utf8').includes('<svg')) {
    href = dataUri('image/svg+xml', logo);
    const { width, height } = new Resvg(logo);
    size = { width, height };
  } else {
    throw new Error('The partner logo must be an SVG or PNG');
  }

  const zoom = MEASURE_SIZE / Math.max(size.width, size.height);
  const rendered = new Resvg(svgDocument(size, image({ x: 0, y: 0, ...size }, href)), {
    fitTo: { mode: 'zoom', value: zoom },
  }).render();
  const ink = inkBounds(rendered.pixels, rendered.width, rendered.height);
  if (!ink) throw new Error('The partner logo has nothing visible');

  const crop = {
    x: ink.x / zoom,
    y: ink.y / zoom,
    width: ink.width / zoom,
    height: ink.height / zoom,
  };
  return { href, size, crop };
}

function textWidth(text: string) {
  const svg = svgDocument(
    { width: WIDTH, height: 100 },
    `<text x="0" y="60" font-style="italic" font-weight="300" font-size="${TEXT_SIZE}">${escapeXml(text)}</text>`,
  );
  return new Resvg(svg, { font: fontOptions }).getBBox()?.width ?? 0;
}

export function renderLockup(logoFile: Buffer, text: string) {
  const logo = measureLogo(logoFile);
  const layout = lockupLayout(logo.crop, textWidth(text));
  const wordmark = fs.readFileSync(path.join(process.cwd(), 'public/bloom_logo.svg'));
  const { crop } = logo;

  const svg = svgDocument(
    layout,
    image(layout.wordmark, dataUri('image/svg+xml', wordmark)) +
      `<text x="${layout.text.x}" y="${layout.text.y}" text-anchor="middle" fill="#000" fill-opacity="0.95" font-style="italic" font-weight="300" font-size="${layout.text.fontSize}">${escapeXml(text)}</text>` +
      `<svg x="${layout.logo.x}" y="${layout.logo.y}" width="${layout.logo.width}" height="${layout.logo.height}" viewBox="${crop.x} ${crop.y} ${crop.width} ${crop.height}">` +
      image({ x: 0, y: 0, ...logo.size }, logo.href) +
      '</svg>',
  );

  const rendered = new Resvg(svg, {
    fitTo: { mode: 'zoom', value: SCALE },
    font: fontOptions,
  }).render();
  return { png: rendered.asPng(), width: rendered.width, height: rendered.height };
}
