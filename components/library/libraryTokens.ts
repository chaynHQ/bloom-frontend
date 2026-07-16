import type { SvgIconComponent } from '@mui/icons-material';
import ArticleRounded from '@mui/icons-material/ArticleRounded';
import ExtensionRounded from '@mui/icons-material/ExtensionRounded';
import RouteRounded from '@mui/icons-material/RouteRounded';
import SmartDisplayRounded from '@mui/icons-material/SmartDisplayRounded';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';

import { type ContentType } from '@/lib/utils/libraryData';

// Design tokens for the library, from the Figma design and kept together so the page and cards
// read as one system. These are library-specific surfaces with no MUI palette equivalent; the
// peach/pink brand colours still come from the theme (`secondary.*`, `primary.dark`).
export const HEADING_FONT = 'var(--font-montserrat)';
export const CARD_SURFACE = '#FFFCFA';
export const CARD_BORDER = '#EBE0E1';
export const CARD_SHADOW = '0px 1px 3px 1px rgba(0,0,0,0.08), 0px 1px 2px 0px rgba(0,0,0,0.08)';
export const PAGE_BG = '#FFF2EB';
// The active search-term chip: a deeper peach than the page so it reads as dismissable.
export const CHIP_BG = '#FFD8C7';
export const CHIP_BG_HOVER = '#FFC9B2';
// Soft peach gradient behind the "Get support" band.
export const BAND_GRADIENT = 'linear-gradient(180deg, #FCE7E1 0%, #FEE9E1 100%)';
// The search field's outline, and the pale panels the cards use for inner surfaces.
export const INPUT_BORDER = '#DECECF';
export const PANEL_SURFACE = '#FCF8F8';
// The format badge's soft blue, and the support card's pink arrow panel.
export const BADGE_BLUE = '#DFF0F5';
export const BADGE_BLUE_BORDER = '#CCE7F0';
export const SUPPORT_ARROW_PANEL = '#F9E2E3';

// Card-badge glyph per content type. A course leads with a "route" glyph (a guided path); single
// sessions use their format glyph.
export const CONTENT_TYPE_ICON: Record<ContentType, SvgIconComponent> = {
  course: RouteRounded,
  audio: VolumeUpRounded,
  written: ArticleRounded,
  video: SmartDisplayRounded,
  activity: ExtensionRounded,
};
