'use client';

import { useTypedSelector } from '@/lib/hooks/store';
import { getEventUserData } from '@/lib/utils/logEvent';
import { richtextContentStyle } from '@/styles/common';
import Video from '../video/Video';
interface StoryblokVideoProps {
  _uid: string;
  _editable: string;
  video: { url: string };
  size: string;
  alignment: string;
  title?: string;
}

const StoryblokVideo = (props: StoryblokVideoProps) => {
  const { video, title, size = 'extra-large', alignment = 'left' } = props;
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);
  if (!video) return <></>;

  const containerStyle = {
    maxWidth: 514, // <515px prevents the "Watch on youtube" button
    width:
      size === 'extra-small'
        ? { xs: 80, md: 120 }
        : size === 'small'
          ? { xs: 140, md: 180 }
          : size === 'medium'
            ? { xs: 200, md: 250 }
            : size === 'large'
              ? { xs: 400, md: 480 }
              : '100%',
    marginY:
      size === 'extra-small'
        ? 2
        : size === 'small'
          ? 3
          : size === 'medium'
            ? 4
            : size === 'large'
              ? 5
              : 6,
    marginLeft: alignment === 'center' || alignment === 'right' ? 'auto' : 0,
    marginRight: alignment === 'center' ? 'auto' : 0,

    ...richtextContentStyle,
  } as const;

  return (
    <Video
      url={video.url}
      eventPrefix="STORYBLOK"
      eventData={eventUserData}
      title={title}
      containerStyles={containerStyle}
    />
  );
};

export default StoryblokVideo;
