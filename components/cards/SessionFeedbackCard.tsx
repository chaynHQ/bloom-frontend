import { Card, CardContent } from '@mui/material';
import { columnStyle } from '../../styles/common';
import RateSessionForm, { RateSessionFormProps } from '../forms/RateSessionForm';

const cardStyle = {
  ...columnStyle,
  backgroundColor: 'background.paper',
  borderRadius: '0px',
  alignItems: 'center',
} as const;

const SessionFeedbackCard = (props: RateSessionFormProps) => {
  return (
    <Card sx={cardStyle}>
      <CardContent>
        <RateSessionForm sessionId={props.sessionId} />
      </CardContent>
    </Card>
  );
};

export default SessionFeedbackCard;
