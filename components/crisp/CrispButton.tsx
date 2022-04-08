import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { Button } from '@mui/material';
import { useEffect } from 'react';
import { SESSION_CRISP_CHAT_OPENED } from '../../constants/events';
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
    (window as any).$crisp = [];
    (window as any).CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
    (() => {
      const d = document;
      const s = d.createElement('script');
      s.src = 'https://client.crisp.chat/l.js';
      s.async = true;
      d.getElementsByTagName('body')[0].appendChild(s);

      email && (window as any).$crisp.push(['set', 'user:email', [email]]);
    })();
  }, [email]);

  const openChatWidget = () => {
    (window as any).$crisp.push(['do', 'chat:open']);
    logEvent(SESSION_CRISP_CHAT_OPENED, eventData);
  };

  return (
    <Button
      sx={crispButtonStyle}
      size="large"
      variant="contained"
      onClick={openChatWidget}
      startIcon={<ChatBubbleOutlineIcon color="error" />}
    >
      {buttonText}
    </Button>
  );
};

export default CrispButton;
