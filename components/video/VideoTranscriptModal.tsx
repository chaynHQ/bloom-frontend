'use client';

import { RichTextOptions } from '@/lib/utils/richText';
import { Box, Button, Modal, Typography } from '@mui/material';
import { ISbRichtext } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: 'calc(100vw - 2rem)', sm: '90%' },
  maxWidth: '1000px',
  maxHeight: '75vh',
  overflowY: 'scroll',
  borderTopLeftRadius: 30,
  borderBottomLeftRadius: 30,
  bgcolor: 'background.paper',
} as const;

const modalContentStyle = {
  maxWidth: 800,
  margin: 'auto',
  paddingX: { xs: 2, sm: 4 },
  paddingY: { xs: 4, sm: 6 },
} as const;

const closeModalStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  borderRadius: 0,
  borderBottomLeftRadius: 20,
} as const;

const transcriptDescriptionStyle = {
  '&:last-of-type': {
    marginBottom: '1em',
  },
};
interface TranscriptModalProps {
  videoName: string;
  content: ISbRichtext;
  openTranscriptModal: boolean | null;
  setOpenTranscriptModal: Dispatch<SetStateAction<boolean | null>>;
}

const VideoTranscriptModal = (props: TranscriptModalProps) => {
  const { videoName, content, openTranscriptModal, setOpenTranscriptModal } = props;

  const tS = useTranslations('Shared');

  return (
    <Modal
      open={openTranscriptModal === true}
      onClose={() => setOpenTranscriptModal(false)}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={modalStyle}>
        <Button
          sx={closeModalStyle}
          color="secondary"
          variant="contained"
          onClick={() => setOpenTranscriptModal(false)}
        >
          {tS('videoTranscript.closeModal')}
        </Button>
        <Box sx={modalContentStyle}>
          <Typography id="modal-title" component="h2" variant="h2">
            {tS('videoTranscript.title')}
          </Typography>
          <Typography id="modal-description" fontStyle="italic" sx={transcriptDescriptionStyle}>
            {tS('videoTranscript.description')}
            {videoName}
          </Typography>
          <div>{render(content, RichTextOptions)}</div>
        </Box>
      </Box>
    </Modal>
  );
};

export default VideoTranscriptModal;
