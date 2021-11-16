import FacebookIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import YoutubeIcon from '@mui/icons-material/Youtube';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import * as React from 'react';
import bloomLogo from '../public/bloom_logo.svg';
import bumbleLogo from '../public/bumble_logo.svg';
import tiktokLogo from '../public/tiktok.svg';
import { rowStyle } from '../styles/common';
import Link from './Link';

interface FooterProps {}

const footerContainerStyle = {
  ...rowStyle,
  backgroundColor: 'common.white',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  paddingY: { xs: 6, md: 10 },
} as const;

const imageContainerStyle = {
  width: 160,
  height: 34,
  marginBottom: 1.75,
} as const;

const descriptionContainerStyle = {
  width: { xs: '100%', md: '45%' },
} as const;

const brandContainerStyle = {
  minWidth: '225px',
  marginRight: 1,
  marginBottom: { xs: 4, md: 0 },
} as const;

const socialsContainerStyle = {
  ...rowStyle,
  marginTop: 1.25,
  marginLeft: -1,
} as const;

const Footer = (props: FooterProps) => {
  //   const {  } = props;
  const t = useTranslations('Shared');

  return (
    <Container sx={footerContainerStyle}>
      <Box sx={brandContainerStyle}>
        <Box sx={imageContainerStyle}>
          <Image alt={t.raw('bloomLogo')} src={bloomLogo} />
        </Box>
        <Typography variant="body2" component="p">
          {t.raw('footer.chaynDetails1')}
        </Typography>
        <Typography variant="body2" component="p">
          {t.raw('footer.chaynDetails2')}
        </Typography>
        <Box sx={socialsContainerStyle}>
          <IconButton
            aria-label="Instagram"
            href="https://www.instagram.com/chaynhq"
          >
            <InstagramIcon />
          </IconButton>
          <IconButton
            aria-label="Facebook"
            href="https://www.facebook.com/chayn/"
          >
            <FacebookIcon />
          </IconButton>
          <IconButton aria-label="Twitter" href="https://twitter.com/ChaynHQ">
            <TwitterIcon />
          </IconButton>
          <IconButton
            aria-label="Youtube"
            href="https://www.youtube.com/channel/UC5_1Ci2SWVjmbeH8_USm-Bg"
          >
            <YoutubeIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={brandContainerStyle}>
        <Box sx={imageContainerStyle}>
          <Image alt={t.raw('bloomLogo')} src={bumbleLogo} />
        </Box>
        <Typography variant="body2" component="p">
          {t.raw('footer.bumbleDetails1')}
        </Typography>
        <Typography variant="body2" component="p">
          {t.raw('footer.bumbleDetails2')}
        </Typography>
        <Box sx={socialsContainerStyle}>
          <IconButton
            aria-label="Instagram"
            href="https://www.instagram.com/bumble"
          >
            <InstagramIcon />
          </IconButton>
          <IconButton aria-label="Tiktok" href="https://www.tiktok.com/@bumble">
            <Image alt={t.raw('bloomLogo')} src={tiktokLogo} />
          </IconButton>
          <IconButton
            aria-label="Youtube"
            href="https://www.youtube.com/channel/UCERo8J7mug7cVcwIKaoJLww"
          >
            <YoutubeIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={descriptionContainerStyle}>
        <Typography variant="body1" component="p" sx={{ mb: 1 }}>
          {t.rich('footer.chaynDescription')}
        </Typography>
        <Link href="#">{t.rich('footer.policies')}</Link>
      </Box>
    </Container>
  );
};

export default Footer;
