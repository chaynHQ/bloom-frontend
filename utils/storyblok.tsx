import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import StoryblokClient from 'storyblok-js-client';
import { MARK_LINK } from 'storyblok-rich-text-react-renderer';
import Link from '../components/Link';
import StoryblokImage from '../components/StoryblokImage';
import { LANGUAGES } from '../constants/enums';

const Storyblok = new StoryblokClient({
  accessToken: process.env.NEXT_PUBLIC_STORYBLOK_TOKEN,
  cache: {
    clear: 'auto',
    type: 'memory',
  },
});

export const RichTextOptions = {
  blokResolvers: {
    ['image']: (props: any) => <StoryblokImage {...props} />,
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

export function useStoryblok(originalStory: any, preview: boolean, locale: LANGUAGES) {
  let [story, setStory] = useState(originalStory);

  // adds the events for updating the visual editor
  // see https://www.storyblok.com/docs/guide/essentials/visual-editor#initializing-the-storyblok-js-bridge
  function initEventListeners() {
    const { StoryblokBridge } = window as any;

    if (typeof StoryblokBridge !== 'undefined') {
      // initialize the bridge with your token
      const storyblokInstance = new StoryblokBridge({
        language: locale,
      });

      // reload on Next.js page on save or publish event in the Visual Editor
      storyblokInstance.on(['change', 'published'], () => location.reload());

      // live update the story on input events
      storyblokInstance.on('input', (event: any) => {
        if (story && event.story._uid === story._uid) {
          setStory(event.story);
        }
      });

      storyblokInstance.on('enterEditmode', (event: any) => {
        // loading the draft version on initial enter of editor
        Storyblok.get(`cdn/stories/${event.storyId}`, {
          version: 'draft',
          language: locale,
        })
          .then(({ data }) => {
            if (data.story) {
              setStory(data.story);
            }
          })
          .catch((error) => {
            console.log(error);
          });
      });
    }
  }

  // appends the bridge script tag to our document
  // see https://www.storyblok.com/docs/guide/essentials/visual-editor#installing-the-storyblok-js-bridge
  function addBridge(callback: any) {
    // check if the script is already present
    const existingScript = document.getElementById('storyblokBridge');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = '//app.storyblok.com/f/storyblok-v2-latest.js';
      script.id = 'storyblokBridge';
      document.body.appendChild(script);
      script.onload = () => {
        // once the scrip is loaded, init the event listeners
        callback();
      };
    } else {
      callback();
    }
  }

  useEffect(() => {
    // only load inside preview mode
    if (preview) {
      // first load the bridge, then initialize the event listeners
      addBridge(initEventListeners);
    }
  }, []);

  useEffect(() => {
    setStory(originalStory);
  }, [originalStory]);

  return story;
}

export default Storyblok;
