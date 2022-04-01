import badooLogo from '../public/badoo_logo.svg';
import bloomBadooLogo from '../public/bloom_badoo_logo.svg';
import bloomBumbleLogo from '../public/bloom_bumble_logo.svg';
import bloomLogo from '../public/bloom_logo.svg';
import bumbleLogo from '../public/bumble_logo.svg';
import illustrationBloomHeadPurple from '../public/illustration_bloom_head_purple.svg';
import illustrationBloomHeadYellow from '../public/illustration_bloom_head_yellow.svg';

export interface Partner {
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
}

export const publicContent: Partner = {
  name: 'Bloom',
  logo: bloomLogo,
  logoAlt: 'alt.bloomLogo',
  website: 'https://chayn.co',
  footerLine1: 'footer.bloomLine1',
  footerLine2: 'footer.bloomLine2',
  facebook: 'https://www.facebook.com/chayn/',
  twitter: 'https://twitter.com/ChaynHQ',
  instagram: 'https://www.instagram.com/chaynhq',
  youtube: 'https://www.youtube.com/channel/UC5_1Ci2SWVjmbeH8_USm-Bg',
};

export const bumbleContent: Partner = {
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

export const badooContent: Partner = {
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
  tiktok: 'https://twitter.com/Badoo',
};

export const getPartnerContent = (partnerName: string) => {
  const partner = partnerName.toLowerCase();
  if (partner === 'bumble') return bumbleContent;
  if (partner === 'badoo') return badooContent;
  return publicContent;
};

export const getAllPartnersContent = () => {
  return [bumbleContent, badooContent];
};
