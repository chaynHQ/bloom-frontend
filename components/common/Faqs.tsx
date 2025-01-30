'use client';

import { Link as i18nLink } from '@/i18n/routing';
import { BASE_URL } from '@/lib/constants/common';
import { THERAPY_FAQ_OPENED } from '@/lib/constants/events';
import { FaqItem } from '@/lib/constants/faqs';
import { PartnerContent } from '@/lib/constants/partners';
import logEvent from '@/lib/utils/logEvent';
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

interface FaqsProps {
  translations: string;
  faqList: Array<FaqItem>;
  partner?: PartnerContent | null;
}

// TO BE REMOVED IF THERAPY FAQS ARE MOVED TO STORYBLOK, use StoryblokFaqs.tsx instead.
const Faqs = (props: FaqsProps) => {
  const { faqList, translations, partner } = props;
  const t = useTranslations(translations);

  const partnerName = partner ? partner.name : '';

  const handleChange = (faqTitle: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    if (isExpanded) {
      logEvent(THERAPY_FAQ_OPENED, { faqTitle: t(faqTitle) });
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
                    <Link
                      component={faq.link?.startsWith(BASE_URL || '/') ? i18nLink : 'a'}
                      href={faq.link ? faq.link : '#'}
                      target="_blank"
                    >
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
