import { Card, CardContent } from '@mui/material';
import { rowStyle } from '../../styles/common';
import RateSessionForm, { RateSessionFormProps } from '../forms/RateSessionForm';

const cardStyle = {
  ...rowStyle,
  backgroundColor: 'background.paper',
  borderRadius: '0px',
  paddingLeft: '10%',
} as const;

const SessionFeedbackCard = (props: RateSessionFormProps) => {
  return (
    <Card sx={cardStyle}>
      <CardContent>
        <RateSessionForm storyId={props.storyId} course={props.course} />
      </CardContent>
    </Card>
  );
};

export default SessionFeedbackCard;
