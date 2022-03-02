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
import { PartnerAccess } from '../../app/partnerAccessSlice';
import { RootState } from '../../app/store';
import { PARTNER_SOCIAL_LINK_CLICKED, SOCIAL_LINK_CLICKED } from '../../constants/events';
import { getPartnerContent, Partner } from '../../constants/partners';
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
  const [eventUserData, setEventUserData] = useState<any>(null);
  const [chaynContnet, setChaynDetails] = useState<Partner | null>(null);
  const [partnerContent, setPartnerContent] = useState<Partner | null>(null);
  const router = useRouter();

  const { user, partnerAccesses } = useTypedSelector((state: RootState) => state);

  useEffect(() => {
    setEventUserData(getEventUserData({ user, partnerAccesses }));
    setChaynDetails(getPartnerContent('public'));

    const { partner } = router.query;

    if (partner) {
      const partnerContentResult = getPartnerContent(partner + '');
      if (partnerContentResult) setPartnerContent(partnerContentResult);
    }

    // TODO: remove when welcome page is driven by storyblok
    if (router.pathname === '/welcome') {
      const partnerContentResult = getPartnerContent('bumble');
      if (partnerContentResult) setPartnerContent(partnerContentResult);
    }
  }, [partnerAccesses, user, router.query]);

  interface PartnerContentProps {
    partner: Partner;
  }

  const PartnerContent = (props: PartnerContentProps) => {
    const { partner } = props;

    const socialLinkEvent =
      partner.name === 'public' ? SOCIAL_LINK_CLICKED : PARTNER_SOCIAL_LINK_CLICKED;

    return (
      <Box key={`${partner.name}_footer`} sx={brandContainerStyle}>
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
  };

  return (
    <Container sx={footerContainerStyle}>
      {chaynContnet && <PartnerContent key="bloom_details" partner={chaynContnet} />}
      {partnerContent && partnerAccesses.length === 0 && (
        <PartnerContent key={`${partnerContent.name}_details`} partner={partnerContent} />
      )}
      {partnerAccesses.map((partnerAccess: PartnerAccess) => {
        const partner: Partner = partnerAccess.partner;
        return <PartnerContent key={`${partner.name}_details`} partner={partner} />;
      })}

      <Box sx={descriptionContainerStyle}>
        <Typography sx={{ mb: 1 }}>{tS('footer.chaynDescription')}</Typography>
        <Link href="#">{tS('footer.policies')}</Link>
      </Box>
    </Container>
  );
};

export default Footer;
