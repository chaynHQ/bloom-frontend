import { Typography } from '@mui/material';
import { ReactNode } from 'react';
import {
  MARK_LINK,
  NODE_HEADING,
  NODE_PARAGRAPH,
  RenderOptions,
} from 'storyblok-rich-text-react-renderer';
import Link from '../components/common/Link';
import StoryblokButton from '../components/storyblok/StoryblokButton';
import StoryblokCard from '../components/storyblok/StoryblokCard';
import StoryblokFaqs from '../components/storyblok/StoryblokFaqs';
import StoryblokImage from '../components/storyblok/StoryblokImage';
import StoryblokQuote from '../components/storyblok/StoryblokQuote';
import StoryblokRow from '../components/storyblok/StoryblokRow';
import StoryblokStatement from '../components/storyblok/StoryblokStatement';
import StoryblokVideo from '../components/storyblok/StoryblokVideo';

export const RichTextOptions: RenderOptions = {
  blokResolvers: {
    ['image']: (props: any) => <StoryblokImage {...props} />,
    ['video']: (props: any) => <StoryblokVideo {...props} />,
    ['row']: (props: any) => <StoryblokRow {...props} />,
    ['quote']: (props: any) => <StoryblokQuote {...props} />,
    ['card']: (props: any) => <StoryblokCard {...props} />,
    ['button']: (props: any) => <StoryblokButton {...props} />,
    ['faq_list']: (props: any) => <StoryblokFaqs {...props} />,
    ['statement']: (props: any) => <StoryblokStatement {...props} />,
  },
  nodeResolvers: {
    [NODE_PARAGRAPH]: (children: ReactNode | null) => (
      <Typography maxWidth={650} paragraph>
        {children}
      </Typography>
    ),
    [NODE_HEADING]: (children: ReactNode | null, { level }) => {
      const headerLevel = level === 1 ? 'h1' : level === 2 ? 'h2' : level === 3 ? 'h3' : 'h4';
      return (
        <Typography variant={headerLevel} component={headerLevel} maxWidth={650}>
          {children}
        </Typography>
      );
    },
  },
  markResolvers: {
    [MARK_LINK]: (children: any, props: any) => {
      const { href, target, linktype } = props;
      if (linktype === 'email') {
        return <a href={`mailto:${href}`}>{children}</a>;
      }

      // Internal links: map to <Link>
      if (href)
        return (
          <Link href={href} target={href?.match(/^(https?:)?\/\//) && '_blank'}>
            {children}
          </Link>
        );
      else return <Typography>{children}</Typography>;
    },
  },
};
