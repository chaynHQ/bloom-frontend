import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { render } from 'storyblok-rich-text-react-renderer';
import { FAQ_OPENED } from '../../constants/events';
import { faqItem } from '../../constants/faqs';
import logEvent from '../../utils/logEvent';
import { RichTextOptions } from '../../utils/richText';

const containerStyle = {
  width: '100%',
  maxWidth: 650,
} as const;
interface StoryblokFaqsProps {
  faqs: Array<faqItem>;
}

const StoryblokFaqs = (props: StoryblokFaqsProps) => {
  const { faqs } = props;

  const handleChange = (faqTitle: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    if (isExpanded) {
      logEvent(FAQ_OPENED, { faqTitle: faqTitle });
    }
  };

  return (
    <Box sx={containerStyle}>
      {faqs.map((faq, i) => (
        <Accordion key={`panel${i}`} onChange={handleChange(faq.title)}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${i}-content`}
            id={`panel${i}-header`}
          >
            <Typography component="h3">{render(faq.title, RichTextOptions)}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              <Typography component="h3">{render(faq.body, RichTextOptions)}</Typography>
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default StoryblokFaqs;
