import { StaticImageData } from 'next/image';
import badooLogo from '../public/badoo_logo.svg';
import bloomBadooLogo from '../public/bloom_badoo_logo.svg';
import bloomBumbleLogo from '../public/bloom_bumble_logo.svg';
import bloomFruitzLogo from '../public/bloom_fruitz_logo.svg';
import bumbleLogo from '../public/bumble_logo.svg';
import chaynLogo from '../public/chayn_logo.png';
import fruitzLogo from '../public/fruitz_logo.svg';
import illustrationBloomHeadPink from '../public/illustration_bloom_head_pink.svg';
import illustrationBloomHeadPurple from '../public/illustration_bloom_head_purple.svg';
import illustrationBloomHeadYellow from '../public/illustration_bloom_head_yellow.svg';

export interface PartnerContent {
  id?: string;
  name: string; // rename to display name to show value is intended for display and can be upper case
  logo: StaticImageData;
  logoAlt: string;
  partnershipLogo?: StaticImageData;
  partnershipLogoAlt?: string;
  bloomGirlIllustration?: StaticImageData;
  website: string;
  footerLine1: string;
  footerLine2: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  github?: string;
}

export const publicContent: PartnerContent = {
  name: 'Chayn',
  logo: chaynLogo,
  logoAlt: 'alt.chaynLogo',
  website: 'https://chayn.co',
  footerLine1: 'footer.chaynLine1',
  footerLine2: 'footer.chaynLine2',
  facebook: 'https://www.facebook.com/chayn/',
  twitter: 'https://twitter.com/ChaynHQ',
  instagram: 'https://www.instagram.com/chaynhq',
  youtube: 'https://www.youtube.com/channel/UC5_1Ci2SWVjmbeH8_USm-Bg',
  github: 'https://github.com/chaynHQ',
};

export const bumbleContent: PartnerContent = {
  name: 'Bumble',
  logo: bumbleLogo,
  logoAlt: 'alt.bumbleLogo',
  partnershipLogo: bloomBumbleLogo,
  partnershipLogoAlt: 'alt.bloomBumbleLogo',
  bloomGirlIllustration: illustrationBloomHeadYellow,
  website: 'https://bumble.com',
  footerLine1: 'footer.bumbleLine1',
  footerLine2: 'footer.bumbleLine2',
  instagram: 'https://www.instagram.com/bumble',
  youtube: 'https://www.youtube.com/channel/UCERo8J7mug7cVcwIKaoJLww',
  tiktok: 'https://www.tiktok.com/@bumble',
};

export const badooContent: PartnerContent = {
  name: 'Badoo',
  logo: badooLogo,
  logoAlt: 'alt.badooLogo',
  partnershipLogo: bloomBadooLogo,
  partnershipLogoAlt: 'alt.bloomBadooLogo',
  bloomGirlIllustration: illustrationBloomHeadPurple,
  website: 'https://badoo.com',
  footerLine1: 'footer.badooLine1',
  footerLine2: 'footer.badooLine2',
  facebook: 'https://www.facebook.com/badoo/',
  instagram: 'https://www.instagram.com/badoo/',
  youtube: 'https://www.youtube.com/c/badoo',
  twitter: 'https://twitter.com/Badoo',
};

export const fruitzContent: PartnerContent = {
  name: 'Fruitz',
  logo: fruitzLogo,
  logoAlt: 'alt.fruitzLogo',
  partnershipLogo: bloomFruitzLogo,
  partnershipLogoAlt: 'alt.bloomFruitzLogo',
  bloomGirlIllustration: illustrationBloomHeadPink,
  website: 'https://fruitz.io',
  footerLine1: 'footer.fruitzLine1',
  footerLine2: 'footer.fruitzLine2',
  instagram: 'https://www.instagram.com/fruitz_app/',
  youtube: 'https://www.youtube.com/channel/UCvfMffckjzOZtYIDeTuZq2w',
  tiktok: 'https://www.tiktok.com/@fruitz_app',
};

export const getPartnerContent = (partnerName: string) => {
  const partner = partnerName.toLowerCase();
  if (partner === 'public') return publicContent;
  if (partner === 'bumble') return bumbleContent;
  if (partner === 'badoo') return badooContent;
  if (partner === 'fruitz') return fruitzContent;
};

export const getAllPartnersContent = () => {
  return [bumbleContent, badooContent, fruitzContent];
};
