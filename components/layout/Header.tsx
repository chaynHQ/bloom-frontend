import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import * as React from 'react';
import { PROGRESS_STATUS } from '../../constants/enums';
import { columnStyle, rowStyle } from '../../styles/common';
import ProgressStatus from '../common/ProgressStatus';

interface HeaderProps {
  title:
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  introduction:
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  imageSrc: StaticImageData;
  imageAlt?: string;
  translatedImageAlt?: string;
  progressStatus?: PROGRESS_STATUS;
  children?: any;
}

const headerContainerStyles = {
  ...rowStyle,
  alignItems: 'end',
  minHeight: { xs: 220, lg: 360 },
  paddingTop: {
    xs: '7rem !important',
    sm: '8rem !important',
    lg: '7.5rem !important',
  },
  paddingBottom: { xs: '3rem !important', sm: '4rem !important' },
  gap: '30px',
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 180, sm: 200, lg: 220 },
  height: { xs: 180, sm: 200, lg: 220 },
  marginLeft: { xs: 'auto', md: 0 },
  marginRight: { xs: 'auto', md: 0 },
} as const;

const textContainerStyle = {
  ...columnStyle,
  justifyContent: 'space-between',
  width: { xs: '100%', sm: 'auto' },
  maxWidth: { xs: '100%', sm: '55%', md: '65%' },
} as const;

const childrenContentStyle = {
  marginBottom: 4,
} as const;

const textContentStyle = {
  marginTop: 'auto',
} as const;

const Header = (props: HeaderProps) => {
  const { title, introduction, imageAlt, translatedImageAlt, imageSrc, progressStatus, children } =
    props;

  const tS = useTranslations('Shared');
  const imageAltText = translatedImageAlt
    ? translatedImageAlt
    : imageAlt
    ? tS(imageAlt)
    : undefined;

  return (
    <Container sx={headerContainerStyles}>
      <Box sx={textContainerStyle}>
        {children && <Box sx={childrenContentStyle}>{children}</Box>}
        <Box sx={textContentStyle}>
          <Typography variant="h1" component="h1">
            {title}
          </Typography>
          <Typography>{introduction}</Typography>
        </Box>
        {progressStatus && <ProgressStatus status={progressStatus} />}
      </Box>
      <Box sx={imageContainerStyle}>
        <Image alt={imageAltText} src={imageSrc} layout="fill" objectFit="contain" />
      </Box>
    </Container>
  );
};

export default Header;
