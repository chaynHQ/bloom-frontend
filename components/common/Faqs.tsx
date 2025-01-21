'use client';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Link,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { THERAPY_FAQ_OPENED } from '../../constants/events';
import { FaqItem } from '../../constants/faqs';
import { PartnerContent } from '../../constants/partners';
import logEvent, { EventUserData } from '../../utils/logEvent';

interface FaqsProps {
  translations: string;
  faqList: Array<FaqItem>;
  partner?: PartnerContent | null;
  eventUserData: EventUserData;
}

// TO BE REMOVED IF THERAPY FAQS ARE MOVED TO STORYBLOK, use StoryblokFaqs.tsx instead.
const Faqs = (props: FaqsProps) => {
  const { faqList, translations, partner, eventUserData } = props;
  const t = useTranslations(translations);

  const partnerName = partner ? partner.name : '';

  const handleChange = (faqTitle: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    if (isExpanded) {
      logEvent(THERAPY_FAQ_OPENED, { faqTitle: t(faqTitle), ...eventUserData });
    }
  };

  return (
    <Box>
      {faqList.map((faq, i) => (
        <Accordion key={`panel${i}`} onChange={handleChange(faq.title)}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${i}-content`}
            id={`panel${i}-header`}
          >
            <Typography component="h3">
              {t.rich(faq.title, {
                partnerName: partnerName,
              })}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              {t.rich(faq.body, {
                partnerName: partnerName,
                ...(faq.link && {
                  faqLink: (children) => (
                    <Link href={faq.link ? faq.link : '#'} target="_blank">
                      {children}
                    </Link>
                  ),
                }),
              })}
            </Typography>
            {faq.list &&
              faq.list.map((item) => (
                <Typography key={item} component="li">
                  {t.rich(item)}
                </Typography>
              ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default Faqs;
