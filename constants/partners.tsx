import bloomLogo from '../public/bloom_logo.svg';
import bumbleLogo from '../public/bumble_logo.svg';

export interface PartnerContent {
  logo: StaticImageData;
  logoAlt: string;
  website: string;
  footerLine1: string;
  footerLine2: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
}

export const publicContent: PartnerContent = {
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

export const bumbleContent: PartnerContent = {
  logo: bumbleLogo,
  logoAlt: 'alt.bumbleLogo',
  website: 'https://bumble.com',
  footerLine1: 'footer.bumbleLine1',
  footerLine2: 'footer.bumbleLine2',
  instagram: 'https://www.instagram.com/bumble',
  youtube: 'https://www.youtube.com/channel/UCERo8J7mug7cVcwIKaoJLww',
  tiktok: 'https://www.tiktok.com/@bumble',
};

export const getPartnerContent = (partner: string) => {
  if (partner === 'public') return publicContent;
  if (partner === 'bumble') return bumbleContent;
};
