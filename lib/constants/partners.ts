import chaynLogo from '@/public/chayn_logo.png';
import { StaticImageData } from 'next/image';

export interface PartnerContent {
  id?: string;
  name: string; // rename to display name to show value is intended for display and can be upper case
  logo: string | StaticImageData;
  logoAlt: string;
  partnershipLogo?: string | StaticImageData;
  partnershipLogoAlt?: string;
  bloomGirlIllustration?: string | StaticImageData;
  website?: string;
  footerLine1: string;
  footerLine2: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  pinterest?: string;
  github?: string;
}

// Chayn's own footer and organisation details.
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
