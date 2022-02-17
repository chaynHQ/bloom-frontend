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
import { getPartnerContent } from '../constants/partners';
import { useTypedSelector } from '../hooks/store';
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
  marginBottom: 1.5,
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

  const { user, partnerAccesses } = useTypedSelector((state: RootState) => state);
  const eventUserData = getEventUserData({ user, partnerAccesses });

  let partners: string[] = ['public'];
  partnerAccesses.forEach((partnerAccess) => {
    partnerAccess.partner.name && partners.push(partnerAccess.partner.name.toLowerCase());
  });

  return (
    <Container sx={footerContainerStyle}>
      {partners.map((partner: string) => {
        const partnerContent = getPartnerContent(partner);
        if (!partnerContent) return;

        return (
          <Box key={`${partner}_footer`} sx={brandContainerStyle}>
            <Link href={partnerContent.website} sx={logoContainerStyle}>
              <Image alt={tS.raw(partnerContent.logoAlt)} src={partnerContent.logo} />
            </Link>
            <Typography variant="body2" component="p">
              {tS.raw(partnerContent.footerLine1)}
            </Typography>
            <Typography variant="body2" component="p">
              {tS.raw(partnerContent.footerLine2)}
            </Typography>
            <Box sx={socialsContainerStyle}>
              {partnerContent.facebook && (
                <IconButton
                  aria-label="Facebook"
                  href={partnerContent.facebook}
                  onClick={() =>
                    logEvent(SOCIAL_LINK_CLICKED, { ...eventUserData, social_account: 'Facebook' })
                  }
                >
                  <FacebookIcon />
                </IconButton>
              )}
              {partnerContent.instagram && (
                <IconButton
                  aria-label="Instagram"
                  href={partnerContent.instagram}
                  onClick={() =>
                    logEvent(SOCIAL_LINK_CLICKED, { ...eventUserData, social_account: 'Instagram' })
                  }
                >
                  <InstagramIcon />
                </IconButton>
              )}
              {partnerContent.twitter && (
                <IconButton
                  aria-label="Twitter"
                  href={partnerContent.twitter}
                  onClick={() =>
                    logEvent(SOCIAL_LINK_CLICKED, { ...eventUserData, social_account: 'Twitter' })
                  }
                >
                  <TwitterIcon />
                </IconButton>
              )}
              {partnerContent.youtube && (
                <IconButton
                  aria-label="Youtube"
                  href={partnerContent.youtube}
                  onClick={() =>
                    logEvent(SOCIAL_LINK_CLICKED, { ...eventUserData, social_account: 'Youtube' })
                  }
                >
                  <YoutubeIcon />
                </IconButton>
              )}
              {partnerContent.tiktok && (
                <IconButton
                  aria-label="Tiktok"
                  href={partnerContent.tiktok}
                  onClick={() =>
                    logEvent(PARTNER_SOCIAL_LINK_CLICKED, {
                      ...eventUserData,
                      social_account: 'Tiktok',
                    })
                  }
                >
                  <Image alt={tS.raw('alt.tiktokLogo')} src={tiktokLogo} />
                </IconButton>
              )}
            </Box>
          </Box>
        );
      })}

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
