'use client';

import { getImageSizes } from '@/lib/utils/imageSizes';
import { isRemoteSvg, storyblokImageSize } from '@/lib/utils/storyblokImage';
import { pageHeaderPaddingTop } from '@/styles/common';
import { Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image, { StaticImageData } from 'next/image';
import * as React from 'react';

const headerContainerStyles = {
  backgroundColor: 'common.white',
  paddingTop: pageHeaderPaddingTop,
  paddingBottom: '40px !important',
} as const;

interface PartnerAdminHeaderProps {
  title:
    string | React.ReactNode[] | React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  introduction?:
    string | React.ReactNode[] | React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  partnerLogoSrc?: string | StaticImageData;
  partnerLogoAlt?: string;
  // Fills `{name}` in the partner logo's alt text.
  partnerName?: string;
}

const logoWidth = 200;

const PartnerAdminHeader = (props: PartnerAdminHeaderProps) => {
  const { partnerLogoAlt, partnerLogoSrc, partnerName, title } = props;

  const tS = useTranslations('Shared');
  const remoteSize = partnerLogoSrc && storyblokImageSize(partnerLogoSrc);

  return (
    <Container sx={headerContainerStyles}>
      <Typography variant="h2" component="h1">
        {title}
      </Typography>
      {partnerLogoAlt && partnerLogoSrc && (
        <Image
          alt={tS(partnerLogoAlt, { name: partnerName ?? '' })}
          src={partnerLogoSrc}
          width={logoWidth}
          {...(remoteSize && {
            height: Math.round((logoWidth * remoteSize.height) / remoteSize.width),
          })}
          unoptimized={isRemoteSvg(partnerLogoSrc)}
          sizes={getImageSizes(logoWidth)}
          style={{
            maxWidth: '100%',
            height: 'auto',
          }}
        />
      )}
    </Container>
  );
};

export default PartnerAdminHeader;
