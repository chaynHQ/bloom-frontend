import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { Button } from '@mui/material';
import { SESSION_CHAT_BUTTON_CLICKED } from '../../constants/events';
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
  const { buttonText, eventData } = props;

  const openChatWidget = () => {
    (window as any).$crisp.push(['do', 'chat:open']);
    logEvent(SESSION_CHAT_BUTTON_CLICKED, eventData);
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
