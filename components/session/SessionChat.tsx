'use client';

import SessionContentCard from '@/components/cards/SessionContentCard';
import { Dots } from '@/components/common/Dots';
import Video from '@/components/video/Video';
import { Link as i18nLink } from '@/i18n/routing';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { Box, Button, List, ListItem, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

const chatDetailIntroStyle = { marginTop: 3, marginBottom: 1.5 } as const;
const listItemStyle = {
  display: 'list-item',
  color: 'primary.dark',
  span: {
    color: 'text.primary',
  },
} as const;
interface SessionChatProps {
  eventData: { [key: string]: any };
}

export const SessionChat = (props: SessionChatProps) => {
  const { eventData } = props;
  const t = useTranslations('Courses');

  const chatList = [
    t('sessionDetail.chat.detailPrivacy'),
    t('sessionDetail.chat.detailTimezone'),
    t('sessionDetail.chat.detailLanguage'),
    t('sessionDetail.chat.detailLegal'),
    t('sessionDetail.chat.detailImmediateHelp'),
  ];

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
        <Box>
          <List sx={{ listStyleType: 'disc', pl: 2 }}>
            {chatList.map((text, index) => (
              <ListItem key={`chat_copy_${index}`} sx={listItemStyle}>
                <Typography component="span">{text}</Typography>
              </ListItem>
            ))}
          </List>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="contained"
            component={i18nLink}
            href="/messaging"
            startIcon={<ChatBubbleOutlineIcon color="error" />}
          >
            {t('sessionDetail.chat.startButton')}
          </Button>
        </Box>
      </SessionContentCard>
    </>
  );
};
