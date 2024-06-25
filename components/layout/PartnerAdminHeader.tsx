import { Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image, { StaticImageData } from 'next/image';
import * as React from 'react';

const headerContainerStyles = {
  backgroundColor: 'common.white',
  paddingY: '40px !important',
} as const;

interface PartnerAdminHeaderProps {
  title:
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  introduction?:
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  partnerLogoSrc?: StaticImageData;
  partnerLogoAlt?: string;
}

const PartnerAdminHeader = (props: PartnerAdminHeaderProps) => {
  const { partnerLogoAlt, partnerLogoSrc, title } = props;

  const tS = useTranslations('Shared');

  return (
    <Container sx={headerContainerStyles}>
      <Typography variant="h2" component="h2" fontSize="1.25rem !important">
        {title}
      </Typography>
      {partnerLogoAlt && partnerLogoSrc && (
        <Image
          alt={tS(partnerLogoAlt)}
          src={partnerLogoSrc}
          width={200}
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
