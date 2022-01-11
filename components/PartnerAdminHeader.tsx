import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import * as React from 'react';

interface PartnerAdminHeaderProps {
  title:
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  introduction:
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  partnerLogoSrc: StaticImageData;
  partnerLogoAlt: string;
}

const headerContainerStyles = {
  backgroundColor: 'common.white',
  paddingY: '40px !important',
} as const;

const PartnerAdminHeader = (props: PartnerAdminHeaderProps) => {
  const { partnerLogoAlt, partnerLogoSrc } = props;

  const tS = useTranslations('Shared');

  return (
    <Container sx={headerContainerStyles}>
      <Typography variant="h2" component="h2" fontSize="1.25rem !important">
        Admin console
      </Typography>
      <Image alt={tS(partnerLogoAlt)} src={partnerLogoSrc} width="200px" />
    </Container>
  );
};

export default PartnerAdminHeader;
