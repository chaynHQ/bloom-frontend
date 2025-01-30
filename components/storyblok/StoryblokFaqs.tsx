'use client';

import { FAQ_OPENED } from '@/lib/constants/events';
import logEvent from '@/lib/utils/logEvent';
import { RichTextOptions } from '@/lib/utils/richText';
import illustrationLeafMix from '@/public/illustration_leaf_mix.svg';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { ISbRichtext, storyblokEditable } from '@storyblok/react/rsc';
import Image from 'next/image';
import { render } from 'storyblok-rich-text-react-renderer';

const containerStyle = {
  width: '100%',
  maxWidth: 650,
} as const;

const accordionDetail = {
  textAlign: 'left',
} as const;

interface StoryblokFaqItem {
  title: ISbRichtext;
  body: ISbRichtext;
}

interface StoryblokFaqsProps {
  _uid: string;
  _editable: string;
  faqs: Array<StoryblokFaqItem>;
  title: string;
}

const StoryblokFaqs = (props: StoryblokFaqsProps) => {
  const { _uid, _editable, faqs, title } = props;

  const handleChange =
    (faqTitle: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      if (isExpanded) {
        logEvent(FAQ_OPENED, { faqTitle: faqTitle });
      }
    };

  return (
    <Box sx={containerStyle} {...storyblokEditable({ _uid, _editable, faqs, title })}>
      <Typography variant="h2" mb={2} textAlign="center">
        {title}
      </Typography>
      <Box textAlign="center">
        <Image alt={'alt'} src={illustrationLeafMix} width={125} height={100} />
      </Box>
      {faqs.map((faq, i) => (
        <Accordion
          key={`panel${i}`}
          onChange={handleChange(faq.title.text || 'Error loading title')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${i}-content`}
            id={`panel${i}-header`}
          >
            <Typography component="h3" textAlign="left">
              {render(faq.title, RichTextOptions)}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={accordionDetail}>
            {render(faq.body, RichTextOptions)}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default StoryblokFaqs;
