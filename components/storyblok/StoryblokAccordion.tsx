import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Icon,
  Typography,
} from '@mui/material';
import Image from 'next/legacy/image';
import { render } from 'storyblok-rich-text-react-renderer';
import { ACCORDION_OPENED } from '../../constants/events';
import logEvent from '../../utils/logEvent';
import { RichTextOptions } from '../../utils/richText';

const containerStyle = {
  width: '100%',
  maxWidth: 800,
  marginBottom: 5,
} as const;

const accordionDetail = {
  textAlign: 'left',
} as const;

const themes = {
  primary: {}, // uses default styling
  secondary: {
    '& .MuiAccordionSummary-expandIconWrapper': { color: 'primary.dark' },
    backgroundColor: 'paleSecondaryLight',
  },
};

const secondaryStyling = {};
interface StoryblokAccordionItemProps {
  body: any;
  title: string;
  icon: { filename: string; alt: string };
}
interface StoryblokAccordionProps {
  accordion_items: Array<StoryblokAccordionItemProps>;
  theme: 'primary' | 'secondary';
}
const StoryblokAccordion = (props: StoryblokAccordionProps) => {
  const { accordion_items, theme } = props;

  const handleChange =
    (accordionTitle: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      if (isExpanded) {
        logEvent(ACCORDION_OPENED, { accordionTitle: accordionTitle });
      }
    };
  return (
    <Box sx={containerStyle}>
      {accordion_items.map((ai, i) => (
        <Accordion key={`panel${i}`} onChange={handleChange(ai.title)} sx={themes[theme]}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${i}-content`}
            id={`panel${i}-header`}
          >
            {ai.icon && (
              <Icon
                sx={{
                  position: 'relative',
                  fontSize: 32,
                  marginBottom: 0,
                  marginRight: 2,
                }}
              >
                <Image alt={ai.icon.alt} src={ai.icon.filename} layout="fill" objectFit="contain" />
              </Icon>
            )}
            {
              <Typography
                sx={{ marginBottom: 0, maxWidth: 800 }}
                component="h3"
                variant="h3"
                textAlign="left"
              >
                {ai.title}
              </Typography>
            }
          </AccordionSummary>
          <AccordionDetails sx={accordionDetail}>
            {render(ai.body, RichTextOptions)}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default StoryblokAccordion;
