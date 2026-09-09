'use client';

import SessionContentCard from '@/components/cards/SessionContentCard';
import Video from '@/components/video/Video';
import { Link as i18nLink } from '@/i18n/routing';
import { SESSION_CHAT_BUTTON_CLICKED } from '@/lib/constants/events';
import logEvent from '@/lib/utils/logEvent';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import { Box, Button, List, ListItem, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

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
    <SessionContentCard
      qaId="session-chat"
      title={t('sessionDetail.chat.title')}
      eventPrefix="SESSION_CHAT"
      eventData={eventData}
    >
      <Typography sx={{ mb: 2 }}>{t('sessionDetail.chat.description')}</Typography>
      <Typography sx={{ mb: 2 }}>{t('sessionDetail.chat.videoIntro')}</Typography>
      <Video
        eventPrefix="SESSION_CHAT_VIDEO"
        eventData={eventData}
        url={t('sessionDetail.chat.videoLink')}
        containerStyles={{ mx: 'auto', my: 2 }}
      />
      <List sx={{ listStyleType: 'disc', paddingInlineStart: 2 }}>
        {chatList.map((text, index) => (
          <ListItem key={`chat_copy_${index}`} sx={listItemStyle}>
            <Typography component="span">{text}</Typography>
          </ListItem>
        ))}
      </List>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button
          variant="contained"
          component={i18nLink}
          href="/messaging"
          startIcon={<ChatBubbleOutlineIcon color="error" />}
          onClick={() => logEvent(SESSION_CHAT_BUTTON_CLICKED, eventData)}
        >
          {t('sessionDetail.chat.startButton')}
        </Button>
      </Box>
    </SessionContentCard>
  );
};
