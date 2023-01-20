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
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { RootState } from '../../app/store';
import { PARTNER_SOCIAL_LINK_CLICKED, SOCIAL_LINK_CLICKED } from '../../constants/events';
import { getPartnerContent, PartnerContent } from '../../constants/partners';
import { useTypedSelector } from '../../hooks/store';
import tiktokLogo from '../../public/tiktok.svg';
import { rowStyle } from '../../styles/common';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import Link from '../common/Link';

const footerContainerStyle = {
  ...rowStyle,
  backgroundColor: 'common.white',
  paddingY: { xs: 6, md: 10 },
} as const;

const logoContainerStyle = {
  display: 'block',
  width: 160,
  height: 34,
  marginBottom: 1.5,
} as const;

const descriptionContainerStyle = {
  flex: 1,
  minWidth: 200,
  marginTop: { xs: 3, md: 0 },
} as const;

const partnersContainerStyle = {
  ...rowStyle,
  justifyContent: 'flex-start',
  gap: { xs: 4, md: 3, lg: 5 },
  maxWidth: { md: '55%' },
  '> div': { minWidth: '220px' },
} as const;

const socialsContainerStyle = {
  ...rowStyle,
  justifyContent: 'flex-start',
  marginTop: 1.25,
  marginLeft: -1,
} as const;

const Footer = () => {
  const tS = useTranslations('Shared');
  const [eventUserData, setEventUserData] = useState<any>(null);
  const [partners, setPartners] = useState<Partner[] | null>(null);
  const router = useRouter();

  const { user, partnerAccesses, partnerAdmin } = useTypedSelector((state: RootState) => state);

  const addUniquePartner = (partnersList: PartnerContent[], partnerName: string) => {
    if (!partnersList.find((p) => p.name.toLowerCase() === partnerName.toLowerCase())) {
      const partnerContentResult = getPartnerContent(partnerName);
      if (partnerContentResult) partnersList.push(partnerContentResult);
    }
  };

  useEffect(() => {
    setEventUserData(getEventUserData({ user, partnerAccesses, partnerAdmin }));
    let partnersList: PartnerContent[] = [getPartnerContent('public')];

    if (partnerAdmin && partnerAdmin.partner) {
      addUniquePartner(partnersList, partnerAdmin.partner.name);
    }

    partnerAccesses.forEach((partnerAccess) => {
      addUniquePartner(partnersList, partnerAccess.partner.name);
    });

    const { partner } = router.query;

    if (partner) {
      addUniquePartner(partnersList, partner + '');
    }

    if (router.pathname.includes('/welcome')) {
      const partnerName = router.asPath.split('/')[2].split('?')[0];
      addUniquePartner(partnersList, partnerName);
    }

    setPartners(partnersList);
  }, [partnerAccesses, user, router, partnerAdmin]);

  return (
    <Container sx={footerContainerStyle}>
      <Box sx={partnersContainerStyle}>
        {partners?.map((partner) => {
          const socialLinkEvent =
            partner.name === 'public' ? SOCIAL_LINK_CLICKED : PARTNER_SOCIAL_LINK_CLICKED;

          return (
            <Box pr="2em" key={`${partner.name}_footer`}>
              <Link href={partner.website} sx={logoContainerStyle}>
                <Image alt={tS(partner.logoAlt)} src={partner.logo} />
              </Link>
              <Typography variant="body2" component="p">
                {tS(partner.footerLine1)}
              </Typography>
              <Typography variant="body2" component="p">
                {tS(partner.footerLine2)}
              </Typography>
              <Box sx={socialsContainerStyle}>
                {partner.facebook && (
                  <IconButton
                    aria-label="Facebook"
                    href={partner.facebook}
                    onClick={() =>
                      logEvent(socialLinkEvent, { ...eventUserData, social_account: 'Facebook' })
                    }
                  >
                    <FacebookIcon />
                  </IconButton>
                )}
                {partner.instagram && (
                  <IconButton
                    aria-label="Instagram"
                    href={partner.instagram}
                    onClick={() =>
                      logEvent(socialLinkEvent, { ...eventUserData, social_account: 'Instagram' })
                    }
                  >
                    <InstagramIcon />
                  </IconButton>
                )}
                {partner.twitter && (
                  <IconButton
                    aria-label="Twitter"
                    href={partner.twitter}
                    onClick={() =>
                      logEvent(socialLinkEvent, { ...eventUserData, social_account: 'Twitter' })
                    }
                  >
                    <TwitterIcon />
                  </IconButton>
                )}
                {partner.youtube && (
                  <IconButton
                    aria-label="Youtube"
                    href={partner.youtube}
                    onClick={() =>
                      logEvent(socialLinkEvent, { ...eventUserData, social_account: 'Youtube' })
                    }
                  >
                    <YoutubeIcon />
                  </IconButton>
                )}
                {partner.tiktok && (
                  <IconButton
                    aria-label="Tiktok"
                    href={partner.tiktok}
                    onClick={() =>
                      logEvent(socialLinkEvent, {
                        ...eventUserData,
                        social_account: 'Tiktok',
                      })
                    }
                  >
                    <Image alt={tS('alt.tiktokLogo')} src={tiktokLogo} />
                  </IconButton>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
      <Box sx={descriptionContainerStyle}>
        <Typography sx={{ mb: 1 }}>{tS('footer.chaynDescription')}</Typography>
        <Link href="https://chayn.notion.site/Public-0bd70701308549518d0c7c72fdd6c9b1">
          {tS('footer.policies')}
        </Link>
      </Box>
    </Container>
  );
};

export default Footer;
