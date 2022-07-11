import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { Button } from '@mui/material';
import Script from 'next/script';
import { useEffect } from 'react';
import {
  SESSION_CRISP_CHAT_INITIATED,
  SESSION_CRISP_CHAT_MESSAGE_SENT,
  SESSION_CRISP_CHAT_OPENED,
} from '../../constants/events';
import logEvent from '../../utils/logEvent';

interface CrispButtonProps {
  buttonText: string;
  email: string | null;
  eventData: {};
}

const crispButtonStyle = {
  margin: 'auto',
} as const;

const CrispButton = (props: CrispButtonProps) => {
  const { buttonText, email, eventData } = props;

  useEffect(() => {
    (() => {
      if (email && (window as any).$crisp) {
        (window as any).$crisp.push(['set', 'user:email', [email]]);
        (window as any).$crisp.push([
          'on',
          'chat:initiated',
          () => {
            logEvent(SESSION_CRISP_CHAT_INITIATED, eventData);
          },
        ]);
        (window as any).$crisp.push([
          'on',
          'message:sent',
          () => {
            logEvent(SESSION_CRISP_CHAT_MESSAGE_SENT, eventData);
          },
        ]);
      }
    })();
  }, [(window as any).$crisp, email]);

  const openChatWidget = () => {
    (window as any).$crisp.push(['do', 'chat:open']);
    logEvent(SESSION_CRISP_CHAT_OPENED, eventData);
  };
  const crispScriptUrl = 'https://client.crisp.chat/l.js';

  return (
    <>
      <Script
        id="crisp-widget"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.$crisp=[];
            window.CRISP_WEBSITE_ID="${process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID}";
            (function(){
              const d = document;
              const s = d.createElement("script");
              s.src = "${crispScriptUrl}";
              s.async = 1;
              d.getElementsByTagName("head")[0].appendChild(s);
            })();`,
        }}
      />
      ;
      <Button
        sx={crispButtonStyle}
        size="large"
        variant="contained"
        onClick={openChatWidget}
        startIcon={<ChatBubbleOutlineIcon color="error" />}
      >
        {buttonText}
      </Button>
    </>
  );
};

export default CrispButton;
