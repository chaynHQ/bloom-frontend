import { Box } from '@mui/system';
import ReactPlayer from 'react-player';
import { richtextContentStyle } from '../../styles/common';

const audioContainerStyle = {
  position: 'relative',
} as const;

interface StoryblokAudioProps {
  audio_file: { filename: string };
  alignment: string;
}

const StoryblokAudio = (props: StoryblokAudioProps) => {
  const { audio_file, alignment = 'left' } = props;
  if (!audio_file) return <></>;

  const containerStyle = {
    ...richtextContentStyle,
    maxWidth: '400px',
    marginLeft: alignment === 'center' || alignment === 'right' ? 'auto' : 0,
    marginRight: alignment === 'center' ? 'auto' : 0,
  } as const;

  return (
    <Box sx={containerStyle}>
      <Box sx={audioContainerStyle}>
        <ReactPlayer width="100%" height="50px" url={audio_file.filename} controls />
      </Box>
    </Box>
  );
};

export default StoryblokAudio;
