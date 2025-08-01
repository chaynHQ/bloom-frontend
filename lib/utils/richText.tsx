import StoryblokAccordion from '@/components/storyblok/StoryblokAccordion';
import StoryblokAudio from '@/components/storyblok/StoryblokAudio';
import StoryblokButton from '@/components/storyblok/StoryblokButton';
import StoryblokCard from '@/components/storyblok/StoryblokCard';
import StoryblokCarousel from '@/components/storyblok/StoryblokCarousel';
import StoryblokImage from '@/components/storyblok/StoryblokImage';
import StoryblokQuote from '@/components/storyblok/StoryblokQuote';
import StoryblokResourceCarousel from '@/components/storyblok/StoryblokResourceCarousel';
import StoryblokRow from '@/components/storyblok/StoryblokRow';
import StoryblokRowColumnBlock from '@/components/storyblok/StoryblokRowColumnBlock';
import StoryblokSpacer from '@/components/storyblok/StoryblokSpacer';
import StoryblokStatement from '@/components/storyblok/StoryblokStatement';
import StoryblokTeamMembersCards from '@/components/storyblok/StoryblokTeamMembersCards';
import StoryblokVideo from '@/components/storyblok/StoryblokVideo';
import { Link as i18nLink } from '@/i18n/routing';
import { BASE_URL } from '@/lib/constants/common';
import { Link, Typography } from '@mui/material';
import { nameToEmoji } from 'gemoji';
import { ReactNode } from 'react';
import {
  MARK_LINK,
  NODE_EMOJI,
  NODE_HEADING,
  NODE_PARAGRAPH,
  RenderOptions,
} from 'storyblok-rich-text-react-renderer';

export const RichTextOptions: RenderOptions = {
  blokResolvers: {
    ['image']: (props: any) => <StoryblokImage {...props} />,
    ['video']: (props: any) => <StoryblokVideo {...props} />,
    ['audio']: (props: any) => <StoryblokAudio {...props} />,
    ['row']: (props: any) => <StoryblokRow {...props} />,
    ['row_new']: (props: any) => <StoryblokRowColumnBlock {...props} />,
    ['quote']: (props: any) => <StoryblokQuote {...props} />,
    ['card']: (props: any) => <StoryblokCard {...props} />,
    ['button']: (props: any) => <StoryblokButton {...props} />,
    ['statement']: (props: any) => <StoryblokStatement {...props} />,
    ['accordion']: (props: any) => <StoryblokAccordion {...props} />,
    ['team_members_cards']: (props: any) => <StoryblokTeamMembersCards {...props} />,
    ['carousel']: (props: any) => <StoryblokCarousel {...props} />,
    ['spacer']: (props: any) => <StoryblokSpacer {...props} />,
    ['resource_carousel']: (props: any) => <StoryblokResourceCarousel {...props} />,
  },
  nodeResolvers: {
    [NODE_PARAGRAPH]: (children: ReactNode | null) => (
      <Typography maxWidth={800} paragraph>
        {children}
      </Typography>
    ),
    [NODE_HEADING]: (children: ReactNode | null, { level }) => {
      const headerLevel = level === 1 ? 'h1' : level === 2 ? 'h2' : level === 3 ? 'h3' : 'h4';
      return (
        <Typography variant={headerLevel} component={headerLevel} maxWidth={800}>
          {children}
        </Typography>
      );
    },
    [NODE_EMOJI]: (children: ReactNode | null, { name }) =>
      name && nameToEmoji[name] ? (
        <span className="emoji" role="img" aria-label={name} aria-hidden={false}>
          {name && nameToEmoji[name]}
        </span>
      ) : null, // The return value is Element | null
  },
  markResolvers: {
    [MARK_LINK]: (children: any, props: any) => {
      const { href, target, linktype } = props;
      if (linktype === 'email') {
        return <a href={`mailto:${href}`}>{children}</a>;
      }

      // Internal links: map to <Link component={i18nLink} >
      if (href)
        return (
          <Link
            component={href.includes(BASE_URL) || href.startsWith('/') ? i18nLink : 'a'}
            href={href}
            target={target || '_blank'}
          >
            {children}
          </Link>
        );
      else return <Typography>{children}</Typography>;
    },
  },
};
