import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { Button } from '@mui/material';
import { useEffect } from 'react';

interface CrispButtonProps {
  buttonText: string;
  email: string | null;
  eventData: {};
}

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

  return (
    <Button
      variant="contained"
      onClick={() => (window as any).$crisp.push(['do', 'chat:open'])}
      startIcon={<ChatBubbleOutlineIcon color="error" />}
    >
      {buttonText}
    </Button>
  );
};

export default CrispButton;
