import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import * as React from 'react';

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
  imageAlt: string;
}

const headerContainerStyles = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  justifyContent: 'space-between',
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 150, md: 250 },
  height: { xs: 150, md: 250 },
  marginLeft: { xs: 0, md: 5 },
  marginTop: { xs: 4, md: 0 },
  alignSelf: { xs: 'center', md: 'auto' },
} as const;

const textContainerStyle = {
  maxWidth: 600,
} as const;

const Header = (props: HeaderProps) => {
  const { title, introduction, imageAlt, imageSrc } = props;

  return (
    <Container sx={headerContainerStyles}>
      <Box sx={textContainerStyle}>
        <Typography variant="h1" component="h1" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" component="p" gutterBottom>
          {introduction}
        </Typography>
      </Box>
      <Box sx={imageContainerStyle}>
        <Image alt={imageAlt} src={imageSrc} layout="fill" objectFit="contain" />
      </Box>
    </Container>
  );
};

export default Header;
