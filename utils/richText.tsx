import { Typography } from '@mui/material';
import { MARK_LINK } from 'storyblok-rich-text-react-renderer';
import Link from '../components/common/Link';
import StoryblokImage from '../components/storyblok/StoryblokImage';
import StoryblokVideo from '../components/storyblok/StoryblokVideo';

export const RichTextOptions = {
  blokResolvers: {
    ['image']: (props: any) => <StoryblokImage {...props} />,
    ['video']: (props: any) => <StoryblokVideo {...props} />,
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
