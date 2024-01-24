import FacebookIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import YoutubeIcon from '@mui/icons-material/YouTube';
import { Box, Container, IconButton, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/legacy/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { PARTNER_SOCIAL_LINK_CLICKED, SOCIAL_LINK_CLICKED } from '../../constants/events';
import { PartnerContent, getPartnerContent } from '../../constants/partners';
import { useTypedSelector } from '../../hooks/store';
import bloomLogo from '../../public/bloom_logo.svg';
import comicReliefLogo from '../../public/comic_relief_logo.png';
import communityFundLogo from '../../public/community_fund_logo.svg';
import tiktokLogo from '../../public/tiktok.svg';
import { rowStyle } from '../../styles/common';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import Link from '../common/Link';

const footerContainerStyle = {
  backgroundColor: 'common.white',
  paddingY: { xs: 6, md: 10 },
} as const;

const fundingContainerStyle = {
  paddingTop: { xs: 4, md: 6 },
  paddingBottom: { xs: 5, md: 7 },
  backgroundColor: 'primary.dark',
  color: 'common.white',
} as const;

const fundingLogosContainerStyle = {
  ...rowStyle,
  justifyContent: 'flex-start',
  mt: 2.5,
  gap: 4,
} as const;

const logoContainerStyle = {
  display: 'block',
  width: 140,
  height: 48,
  marginBottom: 1.5,
} as const;

// Returns responsive style based on number of partners to display
function getDescriptionContainerStyle(totalPartners: number) {
  if (totalPartners === 1) {
    return {
      maxWidth: 340,
      minWidth: 280,
    };
  }
  if (totalPartners > 3) {
    return { maxWidth: { sm: '78%' }, marginRight: { sm: '22%' } };
  }
  return {
    maxWidth: { sm: '78%', [totalPartners === 2 ? 'md' : 'lg']: 340 },
    minWidth: { [totalPartners === 2 ? 'md' : 'lg']: 280 },
    marginRight: { sm: '22%', [totalPartners === 2 ? 'md' : 'lg']: 0 },
  };
}

const partnersContainerStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  gap: { xs: 4, md: 3 },
  flexWrap: 'wrap',
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
  const [partners, setPartners] = useState<PartnerContent[]>([]);
  const router = useRouter();

  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

  const addUniquePartner = (partnersList: PartnerContent[], partnerName: string) => {
    if (!partnersList.find((p) => p.name.toLowerCase() === partnerName.toLowerCase())) {
      const partnerContentResult = getPartnerContent(partnerName);
      if (partnerContentResult) partnersList.push(partnerContentResult);
    }
  };

  useEffect(() => {
    setEventUserData(getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin));
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

    if (router.pathname.includes('/welcome') || router.pathname.includes('/partnership')) {
      const partnerName = router.asPath.split('/')[2].split('?')[0];
      addUniquePartner(partnersList, partnerName);
    }

    setPartners(partnersList);
  }, [partnerAccesses, userCreatedAt, router, partnerAdmin]);

  return (
    <>
      <Container sx={footerContainerStyle}>
        <Box sx={{ width: '100%', mb: 3 }}>
          <Image alt={tS('alt.bloomLogo')} src={bloomLogo} width={140} height={60} />
        </Box>
        <Box sx={{ ...rowStyle, gap: { xs: 6, lg: 8 } }}>
          <Box sx={getDescriptionContainerStyle(partners.length)}>
            <Typography>{tS('footer.chaynDescription')}</Typography>
            <Link
              sx={{ display: 'block', mt: 2 }}
              href="https://chayn.notion.site/Public-0bd70701308549518d0c7c72fdd6c9b1"
            >
              {tS('footer.policies')}
            </Link>
          </Box>
          <Box sx={partnersContainerStyle}>
            {partners.map((partner) => {
              const socialLinkEvent =
                partner.name === 'public' ? SOCIAL_LINK_CLICKED : PARTNER_SOCIAL_LINK_CLICKED;

              return (
                <Box key={`${partner.name}_footer`}>
                  <Link href={partner.website} sx={logoContainerStyle} position="relative">
                    <Image
                      alt={tS(partner.logoAlt)}
                      src={partner.logo}
                      layout="fill"
                      objectFit="contain"
                      objectPosition="left"
                    />
                  </Link>
                  <Typography variant="body2" component="p">
                    {tS.rich(partner.footerLine1)}
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
                          logEvent(socialLinkEvent, {
                            ...eventUserData,
                            social_account: 'Facebook',
                          })
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
                          logEvent(socialLinkEvent, {
                            ...eventUserData,
                            social_account: 'Instagram',
                          })
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
        </Box>
      </Container>
      <Container sx={fundingContainerStyle}>
        <Typography variant="h3" component="p">
          {tS('footer.fundedByTitle')}
        </Typography>
        <Box sx={fundingLogosContainerStyle}>
          <Image alt={tS('alt.comicReliefLogo')} src={comicReliefLogo} width={88} height={64} />
          <Image
            alt={tS('alt.communityFundLogo')}
            src={communityFundLogo}
            width={170}
            height={50}
          />
        </Box>
      </Container>
    </>
  );
};

export default Footer;
