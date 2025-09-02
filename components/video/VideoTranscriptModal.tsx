'use client';

import { STORYBLOK_REFERENCE_CATEGORIES } from '@/lib/constants/enums';
import { RichTextOptions } from '@/lib/utils/richText';
import { Box, Button, Modal, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { render, StoryblokRichtext } from 'storyblok-rich-text-react-renderer';
import ReferencesCategory from '../common/ReferencesCategory';
import { StoryblokReferenceProps } from '../storyblok/StoryblokTypes';

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
  content: StoryblokRichtext;
  references?: StoryblokReferenceProps[];
  openTranscriptModal: boolean | null;
  setOpenTranscriptModal: Dispatch<SetStateAction<boolean | null>>;
}

const VideoTranscriptModal = (props: TranscriptModalProps) => {
  const { videoName, content, references, openTranscriptModal, setOpenTranscriptModal } = props;

  const [books, setBooks] = useState<StoryblokReferenceProps[]>([]);
  const [videoPractices, setVideoPractices] = useState<StoryblokReferenceProps[]>([]);
  const [articles, setArticles] = useState<StoryblokReferenceProps[]>([]);
  const tS = useTranslations('Shared');

  useEffect(() => {
    if (references?.length) {
      setBooks(references.filter((ref) => ref.category === STORYBLOK_REFERENCE_CATEGORIES.BOOK));
      setVideoPractices(
        references.filter((ref) => ref.category === STORYBLOK_REFERENCE_CATEGORIES.VIDEO_PRACTICES),
      );
      setArticles(
        references.filter((ref) => ref.category === STORYBLOK_REFERENCE_CATEGORIES.ARTICLE),
      );
    }
  }, [references]);

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
          <Typography variant="h3" mt={4} mb={2}>
            {tS('references')}
          </Typography>
          {books.length > 0 && (
            <ReferencesCategory category={STORYBLOK_REFERENCE_CATEGORIES.BOOK} references={books} />
          )}
          {articles.length > 0 && (
            <ReferencesCategory
              category={STORYBLOK_REFERENCE_CATEGORIES.ARTICLE}
              references={articles}
            />
          )}
          {videoPractices.length > 0 && (
            <ReferencesCategory
              category={STORYBLOK_REFERENCE_CATEGORIES.VIDEO_PRACTICES}
              references={videoPractices}
            />
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default VideoTranscriptModal;
