import FacebookIcon from '@mui/icons-material/FacebookOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import YoutubeIcon from '@mui/icons-material/YouTube';
import { Box, Container, IconButton, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
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

// Returns responsive style based on number of partners to display
function getDescriptionContainerStyle(totalPartners: number) {
  if (totalPartners === 1) {
    return {
      maxWidth: 340,
      minWidth: 280,
    };
  } else if (totalPartners === 2 || totalPartners === 3) {
    // 2-3 partners to display, use full width for all small-mid screens
    return {
      maxWidth: { sm: '80%', [totalPartners === 2 ? 'md' : 'lg']: 340 },
      minWidth: { [totalPartners === 2 ? 'md' : 'lg']: 280 },
      marginRight: { sm: '20%', [totalPartners === 2 ? 'md' : 'lg']: 0 },
    };
  } else {
    // 4+ partners to display, use full width for all screen sizes
    return { maxWidth: { sm: '80%' }, marginRight: { sm: '20%' } };
  }
}

const footerContainerStyle = {
  backgroundColor: 'common.white',
  paddingY: { xs: 6, md: 10 },
} as const;

const footerContentRowStyle = {
  ...rowStyle,
  gap: { xs: 6, lg: 8 },
} as const;

const logoContainerStyle = {
  display: 'block',
  width: 140,
  height: 48,
  marginBottom: 1.5,
} as const;

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
    let partnersList: PartnerContent[] = [getPartnerContent('public') as PartnerContent];

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

    const referralPartner = window.localStorage.getItem('referralPartner');

    if (referralPartner) {
      addUniquePartner(partnersList, referralPartner);
    }

    setPartners(partnersList);
  }, [partnerAccesses, userCreatedAt, router, partnerAdmin]);

  return (
    <>
      <Container sx={footerContainerStyle} component="footer">
        <Box width="100%" mb={3}>
          <Image
            alt={tS('alt.bloomLogo')}
            src={bloomLogo}
            width={140}
            height={60}
            style={{
              maxWidth: '100%',
              height: 'auto',
            }}
          />
        </Box>
        <Box sx={footerContentRowStyle}>
          <Box sx={getDescriptionContainerStyle(partners.length)}>
            <Typography>
              {tS.rich('footer.chaynDescription', {
                link: (content) => (
                  <Link href="https://www.chayn.co/" target="_blank" fontWeight={600}>
                    {content}
                  </Link>
                ),
              })}
            </Typography>
            <Link
              display="block"
              mt={2}
              href="https://chayn.notion.site/Public-0bd70701308549518d0c7c72fdd6c9b1"
              target="_blank"
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
                  <Link
                    href={partner.website}
                    sx={logoContainerStyle}
                    position="relative"
                    target="_blank"
                  >
                    <Image
                      alt={tS(partner.logoAlt)}
                      src={partner.logo}
                      fill
                      sizes="100vw"
                      style={{
                        objectFit: 'contain',
                        objectPosition: 'left',
                      }}
                    />
                  </Link>
                  <Typography variant="body2" component="p">
                    {tS.rich(partner.footerLine1, {
                      bold: (chunks) => <b>{chunks}</b>,
                    })}
                  </Typography>
                  <Typography variant="body2" component="p">
                    {tS(partner.footerLine2)}
                  </Typography>
                  <Box sx={socialsContainerStyle}>
                    {partner.facebook && (
                      <IconButton
                        href={partner.facebook}
                        aria-label="Facebook"
                        target="_blank"
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
                        href={partner.instagram}
                        aria-label="Instagram"
                        target="_blank"
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
                        href={partner.twitter}
                        aria-label="Twitter"
                        target="_blank"
                        onClick={() =>
                          logEvent(socialLinkEvent, { ...eventUserData, social_account: 'Twitter' })
                        }
                      >
                        <TwitterIcon />
                      </IconButton>
                    )}
                    {partner.youtube && (
                      <IconButton
                        href={partner.youtube}
                        aria-label="Youtube"
                        target="_blank"
                        onClick={() =>
                          logEvent(socialLinkEvent, { ...eventUserData, social_account: 'Youtube' })
                        }
                      >
                        <YoutubeIcon />
                      </IconButton>
                    )}
                    {partner.tiktok && (
                      <IconButton
                        href={partner.tiktok}
                        aria-label="Tiktok"
                        target="_blank"
                        onClick={() =>
                          logEvent(socialLinkEvent, {
                            ...eventUserData,
                            social_account: 'Tiktok',
                          })
                        }
                      >
                        <Image
                          alt={tS('alt.tiktokLogo')}
                          src={tiktokLogo}
                          style={{
                            maxWidth: '100%',
                            height: 'auto',
                          }}
                        />
                      </IconButton>
                    )}
                    {partner.github && (
                      <IconButton
                        href={partner.github}
                        aria-label="Github"
                        target="_blank"
                        onClick={() =>
                          logEvent(socialLinkEvent, {
                            ...eventUserData,
                            social_account: 'Github',
                          })
                        }
                      >
                        <GitHubIcon />
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
          <Link href="https://www.comicrelief.com/" position="relative" target="_blank">
            <Image
              alt={tS('alt.comicReliefLogo')}
              src={comicReliefLogo}
              width={88}
              height={64}
              style={{
                maxWidth: '100%',
                height: 'auto',
              }}
            />
          </Link>
          <Link href="https://www.tnlcommunityfund.org.uk/" position="relative" target="_blank">
            <Image
              alt={tS('alt.communityFundLogo')}
              src={communityFundLogo}
              width={170}
              height={50}
              style={{
                maxWidth: '100%',
                height: 'auto',
              }}
            />
          </Link>
        </Box>
      </Container>
    </>
  );
};

export default Footer;
