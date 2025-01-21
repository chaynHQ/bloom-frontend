'use client';

import { Box } from '@mui/material';
import { storyblokEditable } from '@storyblok/react/rsc';
import dynamic from 'next/dynamic';
import { richtextContentStyle } from '../../styles/common';
// See React Player Hydration issue https://github.com/cookpete/react-player/issues/1474
const ReactPlayer = dynamic(() => import('react-player/file'), { ssr: false });

const audioContainerStyle = {
  position: 'relative',
} as const;

interface StoryblokAudioProps {
  _uid: string;
  _editable: string;
  audio_file: { filename: string };
  alignment: string;
}

const StoryblokAudio = (props: StoryblokAudioProps) => {
  const { _uid, _editable, audio_file, alignment = 'left' } = props;
  if (!audio_file) return <></>;

  const containerStyle = {
    ...richtextContentStyle,
    maxWidth: '400px',
    marginLeft: alignment === 'center' || alignment === 'right' ? 'auto' : 0,
    marginRight: alignment === 'center' ? 'auto' : 0,
    marginBottom: 4,
  } as const;

  return (
    <Box sx={containerStyle} {...storyblokEditable({ _uid, _editable, audio_file, alignment })}>
      <Box sx={audioContainerStyle}>
        <ReactPlayer width="100%" height="50px" url={audio_file.filename} controls />
      </Box>
    </Box>
  );
};

export default StoryblokAudio;
