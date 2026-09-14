'use client';

import { ResourceAudioPlayer } from '@/components/resources/ResourceAudioPlayer';
import { useCreateEventLogMutation } from '@/lib/api';
import { EVENT_LOG_NAME } from '@/lib/constants/enums';
import { useTypedSelector } from '@/lib/hooks/store';
import { getEventUserData } from '@/lib/utils/logEvent';
import { richtextContentStyle } from '@/styles/common';
import { Box } from '@mui/material';
import { storyblokEditable } from '@storyblok/react/rsc';
import { usePathname } from 'next/navigation';

interface StoryblokAudioProps {
  _uid: string;
  _editable: string;
  audio_file: { filename: string };
  alignment: string;
  title?: string;
}

const StoryblokAudio = (props: StoryblokAudioProps) => {
  const { _uid, _editable, audio_file, alignment = 'left', title } = props;
  const [createEventLog] = useCreateEventLogMutation();
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);
  const pathname = usePathname();

  if (!audio_file) return <></>;

  const containerStyle = {
    ...richtextContentStyle,
    maxWidth: '400px',
    marginInlineStart: alignment === 'center' || alignment === 'right' ? 'auto' : 0,
    marginInlineEnd: alignment === 'center' ? 'auto' : 0,
    marginBottom: 4,
  } as const;

  const handleStart = () => {
    if (pathname.includes('grounding')) {
      createEventLog({
        event: EVENT_LOG_NAME.GROUNDING_EXERCISE_STARTED,
        metadata: { title: title || audio_file.filename },
      });
    }
  };

  return (
    <Box sx={containerStyle} {...storyblokEditable({ _uid, _editable, audio_file, alignment })}>
      <ResourceAudioPlayer
        url={audio_file.filename}
        eventPrefix="STORYBLOK_AUDIO"
        eventData={{ ...eventUserData }}
        onStart={handleStart}
      />
    </Box>
  );
};

export default StoryblokAudio;
