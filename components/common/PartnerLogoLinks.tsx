'use client';

import { Link as i18nLink } from '@/i18n/routing';
import { brandKey, groupByBrand } from '@/lib/partners/resolve';
import type { BrandedPartner } from '@/lib/partners/types';
import { getImageSizes } from '@/lib/utils/imageSizes';
import { isRemoteSvg } from '@/lib/utils/storyblokImage';
import { Box, Link } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const logoWidth = 165;

const brandListStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  gap: { xs: 3, sm: 4 },
  listStyle: 'none',
  padding: 0,
  margin: 0,
  marginTop: 2,
} as const;

const brandStyle = {
  flex: 1,
  maxWidth: logoWidth,
  minWidth: 96,
} as const;

// Wide enough for its longest name on one line.
const brandWithSubBrandsStyle = {
  ...brandStyle,
  minWidth: 'max-content',
} as const;

const logoLinkStyle = {
  display: 'block',
  position: 'relative',
  height: 48,
} as const;

const nameListStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  marginTop: 1.5,
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
} as const;

// Pills rather than captions, so the names read as a choice between partners.
const nameLinkStyle = {
  display: 'block',
  paddingX: 1.5,
  paddingY: 0.5,
  border: 1,
  borderColor: 'grey.400',
  borderRadius: 4,
  backgroundColor: 'common.white',
  fontSize: '0.8125rem',
  fontWeight: 600,
  lineHeight: 1.4,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  textDecoration: 'none',
  transition: 'border-color 0.15s, background-color 0.15s',
  '&:hover': {
    borderColor: 'primary.dark',
    backgroundColor: 'primary.light',
  },
} as const;

interface PartnerLogoLinksProps {
  partners: BrandedPartner[];
  href: (slug: string) => string;
  onPartnerClick?: (slug: string) => void;
}

// One logo per brand. A brand with sub-brands also lists each partner by name, since the shared
// logo alone can't say which one a visitor is joining through.
export default function PartnerLogoLinks({
  partners,
  href,
  onPartnerClick,
}: PartnerLogoLinksProps) {
  const tS = useTranslations('Shared');

  return (
    <Box component="ul" sx={brandListStyle}>
      {groupByBrand(partners).map((brand) => {
        const [lead] = brand;
        const hasSubBrands = brand.length > 1;

        return (
          <Box
            component="li"
            key={brandKey(lead)}
            sx={hasSubBrands ? brandWithSubBrandsStyle : brandStyle}
          >
            <Link
              component={i18nLink}
              href={href(lead.slug)}
              aria-label={tS(lead.logoAlt, { name: lead.name })}
              onClick={() => onPartnerClick?.(lead.slug)}
              // The name links below cover keyboard users, so the logo isn't a second tab stop.
              tabIndex={hasSubBrands ? -1 : undefined}
              sx={logoLinkStyle}
            >
              <Image
                alt={tS(lead.logoAlt, { name: lead.name })}
                src={lead.logo}
                unoptimized={isRemoteSvg(lead.logo)}
                fill
                sizes={getImageSizes(logoWidth)}
                style={{ objectFit: 'contain' }}
              />
            </Link>
            {hasSubBrands && (
              <Box component="ul" sx={nameListStyle}>
                {brand.map((partner) => (
                  <li key={partner.slug}>
                    <Link
                      component={i18nLink}
                      href={href(partner.slug)}
                      onClick={() => onPartnerClick?.(partner.slug)}
                      sx={nameLinkStyle}
                    >
                      {partner.name}
                    </Link>
                  </li>
                ))}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
