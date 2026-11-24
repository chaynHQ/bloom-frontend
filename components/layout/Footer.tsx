'use client';

import { PARTNER_SOCIAL_LINK_CLICKED, SOCIAL_LINK_CLICKED } from '@/lib/constants/events';
import { publicContent } from '@/lib/constants/partners';
import { usePathname } from '@/i18n/routing';
import { useTypedSelector } from '@/lib/hooks/store';
import { useCookieReferralPartner } from '@/lib/hooks/useCookieReferralPartner';
import { useHydratedSearchParams } from '@/lib/hooks/useHydratedSearchParams';
import { useIsRtl } from '@/lib/hooks/useIsRtl';
import { useUserAuthStatus } from '@/lib/hooks/useUserAuthStatus';
import { useBrandedPartners, useLaunchedPartners } from '@/lib/partners/PartnersProvider';
import { getFooterPartners } from '@/lib/partners/resolve';
import bloomLogo from '@/public/bloom_logo.svg';
import comicReliefLogo from '@/public/comic_relief_logo.png';
import communityFundLogo from '@/public/community_fund_logo.svg';
import tiktokLogo from '@/public/tiktok.svg';
import FacebookIcon from '@mui/icons-material/FacebookOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import InstagramIcon from '@mui/icons-material/Instagram';
import PinterestIcon from '@mui/icons-material/Pinterest';
import XIcon from '@mui/icons-material/X';
import YoutubeIcon from '@mui/icons-material/YouTube';
import { Box, Container, IconButton, Link, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useMemo } from 'react';

import { getImageSizes } from '@/lib/utils/imageSizes';
import { isRemoteSvg } from '@/lib/utils/storyblokImage';
import logEvent from '@/lib/utils/logEvent';
import { rowStyle } from '@/styles/common';

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
      marginInlineEnd: { sm: '20%', [totalPartners === 2 ? 'md' : 'lg']: 0 },
    };
  } else {
    // 4+ partners to display, use full width for all screen sizes
    return { maxWidth: { sm: '80%' }, marginInlineEnd: { sm: '20%' } };
  }
}

const footerContainerStyle = {
  backgroundColor: 'common.white',
  paddingY: { xs: 6, md: 8 },
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
  marginInlineStart: -1,
} as const;

const fundingContainerStyle = {
  paddingTop: { xs: 4, md: 6 },
  paddingBottom: { xs: 5, md: 7 },
  backgroundColor: 'primary.dark',
  color: 'common.white',
  '--focus-ring-color': '#fff',
} as const;

const fundingLogosContainerStyle = {
  ...rowStyle,
  justifyContent: 'flex-start',
  mt: 2.5,
  gap: 4,
} as const;

// Gets "bumble" from /welcome/bumble
const getWelcomePageSlug = (pathname: string) =>
  pathname.startsWith('/welcome/') ? pathname.split('/')[2] : undefined;

const Footer = () => {
  const tS = useTranslations('Shared');
  const searchParams = useHydratedSearchParams();
  const isRtl = useIsRtl();

  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const referralPartner = useCookieReferralPartner();
  const authStatus = useUserAuthStatus();
  const pathname = usePathname();

  const brandedPartners = useBrandedPartners();
  const launchedPartners = useLaunchedPartners();

  const partners = useMemo(
    () =>
      getFooterPartners({
        branded: brandedPartners,
        launched: launchedPartners,
        partnerNames: [
          partnerAdmin?.partner?.name,
          ...partnerAccesses.map((partnerAccess) => partnerAccess.partner.name),
        ],
        welcomePageSlug: getWelcomePageSlug(pathname),
        // Once someone is signed in, or may be, a partner they browsed or were referred by
        // before isn't theirs to be branded with.
        visitorSlugs:
          authStatus === 'signedOut' ? [searchParams?.get('partner'), referralPartner] : [],
      }),
    [
      brandedPartners,
      launchedPartners,
      partnerAccesses,
      partnerAdmin,
      pathname,
      authStatus,
      searchParams,
      referralPartner,
    ],
  );

  return (
    <>
      <Container sx={footerContainerStyle} component="footer">
        <Box
          sx={{
            width: '100%',
            mb: 3,
          }}
        >
          <Image alt={tS('alt.bloomLogo')} src={bloomLogo} width={140} height={60} />
        </Box>
        <Box sx={footerContentRowStyle}>
          <Box sx={getDescriptionContainerStyle(partners.length)}>
            <Typography>
              {tS.rich('footer.chaynDescription', {
                link: (content) => (
                  <Link
                    href="https://www.chayn.co/"
                    target="_blank"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    {content}
                  </Link>
                ),
              })}
            </Typography>
            <Link
              href="https://chayn.notion.site/Public-0bd70701308549518d0c7c72fdd6c9b1"
              target="_blank"
              sx={{
                display: 'block',
                mt: 2,
              }}
            >
              {tS('footer.policies')}
            </Link>
            <Link
              href="https://app.eu.vanta.com/chayn.co/trust/yrbp5r3nj96a1dlq15h0y"
              target="_blank"
              sx={{
                display: 'block',
                mt: 2,
              }}
            >
              {tS('footer.trustCenter')}
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
                    target="_blank"
                    sx={[
                      {
                        position: 'relative',
                      },
                      ...(Array.isArray(logoContainerStyle)
                        ? logoContainerStyle
                        : [logoContainerStyle]),
                    ]}
                  >
                    <Image
                      alt={tS(partner.logoAlt, { name: partner.name })}
                      src={partner.logo}
                      unoptimized={isRemoteSvg(partner.logo)}
                      fill
                      sizes={getImageSizes(logoContainerStyle.width)}
                      style={{
                        objectFit: 'contain',
                        objectPosition: isRtl ? 'right' : 'left',
                      }}
                    />
                  </Link>
                  <Typography variant="body2" component="p">
                    {tS.rich(partner.footerLine1, {
                      bold: (chunks) => <b>{chunks}</b>,
                    })}
                  </Typography>
                  <Typography variant="body2" component="p">
                    {/* Chayn's second line is translated; a partner's is its legal name. */}
                    {partner === publicContent ? tS(partner.footerLine2) : partner.footerLine2}
                  </Typography>
                  <Box sx={socialsContainerStyle}>
                    {partner.facebook && (
                      <IconButton
                        href={partner.facebook}
                        aria-label="Facebook"
                        target="_blank"
                        onClick={() =>
                          logEvent(socialLinkEvent, {
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
                        aria-label="X"
                        target="_blank"
                        onClick={() => logEvent(socialLinkEvent, { social_account: 'X' })}
                      >
                        <XIcon />
                      </IconButton>
                    )}
                    {partner.youtube && (
                      <IconButton
                        href={partner.youtube}
                        aria-label="Youtube"
                        target="_blank"
                        onClick={() => logEvent(socialLinkEvent, { social_account: 'Youtube' })}
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
                            social_account: 'Tiktok',
                          })
                        }
                      >
                        <Image alt={tS('alt.tiktokLogo')} src={tiktokLogo} width={24} height={24} />
                      </IconButton>
                    )}
                    {partner.pinterest && (
                      <IconButton
                        href={partner.pinterest}
                        aria-label="Pinterest"
                        target="_blank"
                        onClick={() => logEvent(socialLinkEvent, { social_account: 'Pinterest' })}
                      >
                        <PinterestIcon />
                      </IconButton>
                    )}
                    {partner.github && (
                      <IconButton
                        href={partner.github}
                        aria-label="Github"
                        target="_blank"
                        onClick={() =>
                          logEvent(socialLinkEvent, {
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
        <Typography variant="h3" component="p" sx={{ color: '#ffffff !important' }}>
          {tS('footer.fundedByTitle')}
        </Typography>
        <Box sx={fundingLogosContainerStyle}>
          <Link
            href="https://www.comicrelief.com/"
            target="_blank"
            sx={{
              position: 'relative',
            }}
          >
            <Image alt={tS('alt.comicReliefLogo')} src={comicReliefLogo} width={88} height={64} />
          </Link>
          <Link
            href="https://www.tnlcommunityfund.org.uk/"
            target="_blank"
            sx={{
              position: 'relative',
            }}
          >
            <Image
              alt={tS('alt.communityFundLogo')}
              src={communityFundLogo}
              width={170}
              height={50}
            />
          </Link>
        </Box>
      </Container>
    </>
  );
};

export default Footer;
