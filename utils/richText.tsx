import { Typography } from '@mui/material';
import { ReactNode } from 'react';
import {
  MARK_LINK,
  NODE_HEADING,
  NODE_PARAGRAPH,
  RenderOptions,
} from 'storyblok-rich-text-react-renderer';
import Link from '../components/common/Link';
import StoryblokImage from '../components/storyblok/StoryblokImage';
import StoryblokRow from '../components/storyblok/StoryblokRow';
import StoryblokVideo from '../components/storyblok/StoryblokVideo';

export const RichTextOptions: RenderOptions = {
  blokResolvers: {
    ['image']: (props: any) => <StoryblokImage {...props} />,
    ['video']: (props: any) => <StoryblokVideo {...props} />,
    ['row']: (props: any) => <StoryblokRow {...props} />,
  },
  nodeResolvers: {
    [NODE_PARAGRAPH]: (children: ReactNode | null) => (
      <Typography maxWidth={650}>{children}</Typography>
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
      if (href?.match(/^(https?:)?\/\//)) {
        // External links: map to <a>
        return (
          <a href={href} target={target}>
            {children}
          </a>
        );
      }
      // Internal links: map to <Link>
      if (href)
        return (
          <Link href={href}>
            <a>{children}</a>
          </Link>
        );
      else return <Typography>{children}</Typography>;
    },
  },
};
