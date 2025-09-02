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
  right: { xs: 0, sm: 'unset' },
  left: { xs: 'unset', sm: '50%' },
  transform: { xs: 'translate(0, -50%)', sm: 'translate(-50%, -50%)' },
  width: { xs: 'calc(100vw - 1rem)', sm: '90%', md: 800 },
  maxHeight: '75vh',
  overflowY: 'scroll',
  borderTopLeftRadius: 30,
  borderBottomLeftRadius: 30,
  bgcolor: 'background.paper',
} as const;

const modalContentStyle = {
  margin: 'auto',
  paddingX: { xs: 4, sm: 6 },
  paddingY: { xs: 6, sm: 8 },
} as const;

const closeModalStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  borderRadius: 0,
  borderBottomLeftRadius: 20,
} as const;

const screenReaderOnly = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0',
} as const;

interface TranscriptModalProps {
  title: string;
  content: StoryblokRichtext;
  references?: StoryblokReferenceProps[];
  openTranscriptModal: boolean | null;
  setOpenTranscriptModal: Dispatch<SetStateAction<boolean | null>>;
}

const VideoTranscriptModal = (props: TranscriptModalProps) => {
  const { title, content, references, openTranscriptModal, setOpenTranscriptModal } = props;

  const [books, setBooks] = useState<StoryblokReferenceProps[]>([]);
  const [videoPractices, setVideoPractices] = useState<StoryblokReferenceProps[]>([]);
  const [articles, setArticles] = useState<StoryblokReferenceProps[]>([]);
  const [audios, setAudios] = useState<StoryblokReferenceProps[]>([]);
  const tS = useTranslations('Shared');

  useEffect(() => {
    if (references?.length) {
      setBooks(references.filter((ref) => ref.category === STORYBLOK_REFERENCE_CATEGORIES.BOOK));
      setVideoPractices(
        references.filter((ref) => ref.category === STORYBLOK_REFERENCE_CATEGORIES.VIDEO_PRACTICE),
      );
      setArticles(
        references.filter((ref) => ref.category === STORYBLOK_REFERENCE_CATEGORIES.ARTICLE),
      );
      setAudios(references.filter((ref) => ref.category === STORYBLOK_REFERENCE_CATEGORIES.AUDIO));
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
          <Typography sx={screenReaderOnly}>{tS('videoTranscript.title')}</Typography>
          <Typography id="modal-title" component="h2" variant="h1">
            {title}
          </Typography>
          <Box>{render(content, RichTextOptions)}</Box>
          {references && (
            <>
              <Typography variant="h3" mt={4} mb={2}>
                {tS('references')}
              </Typography>
              {books.length > 0 && (
                <ReferencesCategory
                  category={STORYBLOK_REFERENCE_CATEGORIES.BOOK}
                  references={books}
                />
              )}
              {articles.length > 0 && (
                <ReferencesCategory
                  category={STORYBLOK_REFERENCE_CATEGORIES.ARTICLE}
                  references={articles}
                />
              )}
              {videoPractices.length > 0 && (
                <ReferencesCategory
                  category={STORYBLOK_REFERENCE_CATEGORIES.VIDEO_PRACTICE}
                  references={videoPractices}
                />
              )}
              {audios.length > 0 && (
                <ReferencesCategory
                  category={STORYBLOK_REFERENCE_CATEGORIES.AUDIO}
                  references={audios}
                />
              )}
            </>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default VideoTranscriptModal;
