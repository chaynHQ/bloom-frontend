import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import { faqItem } from '../constants/faqs';
import Link from './Link';

interface FaqsProps {
  translations: string;
  faqList: Array<faqItem>;
}

const faqsContainerStyle = {
  maxWidth: '680px !important',
  margin: 'auto',
} as const;

const Faqs = (props: FaqsProps) => {
  const { faqList, translations } = props;
  const t = useTranslations(translations);

  return (
    <Box>
      {faqList.map((faq, i) => (
        <Accordion key={`panel${i}`}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${i}-content`}
            id={`panel${i}-header`}
          >
            <Typography variant="body1" component="h3">
              {t.rich(faq.title)}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              {t.rich(
                faq.body,
                faq.link
                  ? {
                      faqLink: (children) => (
                        <Link href={faq.link ? faq.link : '#'}>{children}</Link>
                      ),
                    }
                  : {},
              )}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default Faqs;
