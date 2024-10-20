import { Dots } from '../common/Dots';
import SessionContentCard from '../cards/SessionContentCard';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { Box, Typography } from '@mui/material';
import Video from '../video/Video';
import CrispButton from '../crisp/CrispButton';
import { useTranslations } from 'next-intl';
import { EventData } from './SessionVideo';
import { useTypedSelector } from '../../hooks/store';
import { getChatAccess } from '../../utils/getChatAccess';
import { useEffect, useState } from 'react';
import { PartnerAccesses } from '../../store/partnerAccessSlice';
import { PartnerAdmin } from '../../store/partnerAdminSlice';

const chatDetailIntroStyle = { marginTop: 3, marginBottom: 1.5 } as const;

const crispButtonContainerStyle = {
  paddingTop: 4,
  paddingBottom: 1,
  display: 'flex',
} as const;
export interface SessionChatProps {
  eventData: EventData;
  partnerAccesses: PartnerAccesses;
  partnerAdmin: PartnerAdmin;
}
export const SessionChat = (props: SessionChatProps) => {
  const { eventData, partnerAccesses, partnerAdmin } = props;
  const t = useTranslations('Courses');
  const userEmail = useTypedSelector((state) => state.user.email);
  const [liveChatAccess, setLiveChatAccess] = useState<boolean>(false);

  useEffect(() => {
    getChatAccess(partnerAccesses, setLiveChatAccess, partnerAdmin);
  }, [partnerAccesses, partnerAdmin]);

  return (
    liveChatAccess && (
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
          <Box sx={crispButtonContainerStyle}>
            <CrispButton
              email={userEmail}
              eventData={eventData}
              buttonText={t('sessionDetail.chat.startButton')}
            />
          </Box>
        </SessionContentCard>
      </>
    )
  );
};
