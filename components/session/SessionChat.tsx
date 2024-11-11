import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { Box, Button, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import SessionContentCard from '../cards/SessionContentCard';
import { Dots } from '../common/Dots';
import Link from '../common/Link';
import Video from '../video/Video';
import { EventData } from './SessionVideo';

const chatDetailIntroStyle = { marginTop: 3, marginBottom: 1.5 } as const;

export interface SessionChatProps {
  eventData: EventData;
}

export const SessionChat = (props: SessionChatProps) => {
  const { eventData } = props;
  const t = useTranslations('Courses');

  return (
    <>
      <Dots />
      <SessionContentCard
        title={t('sessionDetail.chat.title')}
        titleIcon={ChatBubbleOutlineIcon}
        titleIconSize={24}
        eventPrefix="SESSION_CHAT"
        eventData={eventData}
      >
        <Typography paragraph>{t('sessionDetail.chat.description')}</Typography>
        <Typography paragraph>{t('sessionDetail.chat.videoIntro')}</Typography>
        <Video
          eventPrefix="SESSION_CHAT_VIDEO"
          eventData={eventData}
          url={t('sessionDetail.chat.videoLink')}
          containerStyles={{ mx: 'auto', my: 2 }}
        ></Video>
        <Box sx={chatDetailIntroStyle}>
          <Typography>{t('sessionDetail.chat.detailIntro')}</Typography>
        </Box>
        <Box>
          <ul>
            <li>{t('sessionDetail.chat.detailPrivacy')}</li>
            <li>{t('sessionDetail.chat.detailTimezone')}</li>
            <li>{t('sessionDetail.chat.detailLanguage')}</li>
            <li>{t('sessionDetail.chat.detailLegal')}</li>
            <li>{t('sessionDetail.chat.detailImmediateHelp')}</li>
          </ul>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="contained"
            href="/messaging"
            component={Link}
            startIcon={<ChatBubbleOutlineIcon color="error" />}
          >
            {t('sessionDetail.chat.startButton')}
          </Button>
        </Box>
      </SessionContentCard>
    </>
  );
};
