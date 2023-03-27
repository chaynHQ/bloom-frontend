import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { Box, Container, Typography } from '@mui/material';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { RootState } from '../../app/store';
import SessionContentCard from '../../components/cards/SessionContentCard';
import CrispButton from '../../components/crisp/CrispButton';
import Header, { HeaderProps } from '../../components/layout/Header';
import Video from '../../components/video/Video';
import { LANGUAGES } from '../../constants/enums';
import { useTypedSelector } from '../../hooks/store';
import chatIconWithBackground from '../../public/chat_icon_with_background.svg';
import { columnStyle } from '../../styles/common';

import { getEventUserData } from '../../utils/logEvent';

const containerStyle = {
  backgroundColor: 'secondary.light',
} as const;

const cardColumnStyle = {
  ...columnStyle,
  alignItems: 'center',
  gap: { xs: 2, md: 3 },
} as const;

const formContainerStyle = {
  width: { xs: '100%', sm: '70%', md: '47%' },
} as const;

interface Props {
  preview: boolean;
  locale: LANGUAGES;
}
const chatDetailIntroStyle = { marginTop: 3, marginBottom: 1.5 } as const;
const crispButtonContainerStyle = {
  paddingTop: 4,
  paddingBottom: 1,
  display: 'flex',
} as const;
const Chat: NextPage<Props> = () => {
  const t = useTranslations('Courses');

  const { user, partnerAccesses, partnerAdmin } = useTypedSelector((state: RootState) => state);

  const headerProps: HeaderProps = {
    title: '1-1 Chat',
    introduction:
      'Our 1-1 chat service means you can chat with our Bloom team of survivors and allies who are experienced in supporting one another. We’re here for you to share your reflections, feelings and questions as you work through our Bloom courses.',
    imageSrc: chatIconWithBackground,
    translatedImageAlt: 'image',
  };

  const eventUserData = getEventUserData({ user, partnerAccesses, partnerAdmin });

  return (
    <>
      <Head>{headerProps.title}</Head>
      <Box>
        <Header {...headerProps} />
        <Container sx={containerStyle}>
          <Box sx={cardColumnStyle}>
            <SessionContentCard
              title={t('sessionDetail.chat.title')}
              titleIcon={ChatBubbleOutlineIcon}
              titleIconSize={24}
              eventPrefix="SESSION_CHAT"
              eventData={eventUserData}
            >
              <Typography paragraph>{t('sessionDetail.chat.description')}</Typography>
              <Typography paragraph>{t('sessionDetail.chat.videoIntro')}</Typography>
              <Video
                eventPrefix="SESSION_CHAT_VIDEO"
                eventData={eventUserData}
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
                  email={user.email}
                  eventData={eventUserData}
                  buttonText={t('sessionDetail.chat.startButton')}
                />
              </Box>
            </SessionContentCard>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: {
        ...require(`../../messages/shared/${locale}.json`),
        ...require(`../../messages/navigation/${locale}.json`),
        ...require(`../../messages/courses/${locale}.json`),
      },
    },
  };
}

export default Chat;
