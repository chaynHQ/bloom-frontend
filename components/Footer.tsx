import FacebookIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import YoutubeIcon from '@mui/icons-material/YouTube';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import * as React from 'react';
import { RootState } from '../app/store';
import { PARTNER_SOCIAL_LINK_CLICKED, SOCIAL_LINK_CLICKED } from '../constants/events';
import { useTypedSelector } from '../hooks/store';
import bloomLogo from '../public/bloom_logo.svg';
import bumbleLogo from '../public/bumble_logo.svg';
import tiktokLogo from '../public/tiktok.svg';
import { rowStyle } from '../styles/common';
import logEvent, { getEventUserData } from '../utils/logEvent';
import Link from './Link';

const footerContainerStyle = {
  ...rowStyle,
  backgroundColor: 'common.white',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  paddingY: { xs: 6, md: 10 },
} as const;

const logoContainerStyle = {
  display: 'block',
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

const Footer = () => {
  const tS = useTranslations('Shared');

  const { user, partnerAccess, partnerAdmin, partner } = useTypedSelector(
    (state: RootState) => state,
  );
  const eventUserData = getEventUserData({ user, partnerAccess, partnerAdmin, partner });

  return (
    <Container sx={footerContainerStyle}>
      <Box sx={brandContainerStyle}>
        <Link href={'https://chayn.co'} sx={logoContainerStyle}>
          <Image alt={tS.raw('alt.bloomLogo')} src={bloomLogo} />
        </Link>
        <Typography variant="body2" component="p">
          {tS.raw('footer.chaynDetails1')}
        </Typography>
        <Typography variant="body2" component="p">
          {tS.raw('footer.chaynDetails2')}
        </Typography>
        <Box sx={socialsContainerStyle}>
          <IconButton
            aria-label="Instagram"
            href="https://www.instagram.com/chaynhq"
            onClick={() => logEvent(SOCIAL_LINK_CLICKED, { ...eventUserData, social_account: '' })}
          >
            <InstagramIcon />
          </IconButton>
          <IconButton
            aria-label="Facebook"
            href="https://www.facebook.com/chayn/"
            onClick={() =>
              logEvent(SOCIAL_LINK_CLICKED, { ...eventUserData, social_account: 'Facebook' })
            }
          >
            <FacebookIcon />
          </IconButton>
          <IconButton
            aria-label="Twitter"
            href="https://twitter.com/ChaynHQ"
            onClick={() =>
              logEvent(SOCIAL_LINK_CLICKED, { ...eventUserData, social_account: 'Twitter' })
            }
          >
            <TwitterIcon />
          </IconButton>
          <IconButton
            aria-label="Youtube"
            href="https://www.youtube.com/channel/UC5_1Ci2SWVjmbeH8_USm-Bg"
            onClick={() =>
              logEvent(SOCIAL_LINK_CLICKED, { ...eventUserData, social_account: 'Youtube' })
            }
          >
            <YoutubeIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={brandContainerStyle}>
        <Link href={'https://bumble.com'} sx={logoContainerStyle}>
          <Image alt={tS.raw('alt.bumbleLogo')} src={bumbleLogo} />
        </Link>
        <Typography variant="body2" component="p">
          {tS.raw('footer.bumbleDetails1')}
        </Typography>
        <Typography variant="body2" component="p">
          {tS.raw('footer.bumbleDetails2')}
        </Typography>
        <Box sx={socialsContainerStyle}>
          <IconButton
            aria-label="Instagram"
            href="https://www.instagram.com/bumble"
            onClick={() =>
              logEvent(PARTNER_SOCIAL_LINK_CLICKED, {
                ...eventUserData,
                social_account: 'Instagram',
              })
            }
          >
            <InstagramIcon />
          </IconButton>
          <IconButton
            aria-label="Tiktok"
            href="https://www.tiktok.com/@bumble"
            onClick={() =>
              logEvent(PARTNER_SOCIAL_LINK_CLICKED, { ...eventUserData, social_account: 'Tiktok' })
            }
          >
            <Image alt={tS.raw('alt.bloomLogo')} src={tiktokLogo} />
          </IconButton>
          <IconButton
            aria-label="Youtube"
            href="https://www.youtube.com/channel/UCERo8J7mug7cVcwIKaoJLww"
            onClick={() =>
              logEvent(PARTNER_SOCIAL_LINK_CLICKED, { ...eventUserData, social_account: 'Youtube' })
            }
          >
            <YoutubeIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={descriptionContainerStyle}>
        <Typography variant="body1" component="p" sx={{ mb: 1 }}>
          {tS.rich('footer.chaynDescription')}
        </Typography>
        <Link href="#">{tS.rich('footer.policies')}</Link>
      </Box>
    </Container>
  );
};

export default Footer;
