'use client';

import { ACCORDION_OPENED, generateAccordionEvent } from '@/lib/constants/events';
import { getImageSizes } from '@/lib/utils/imageSizes';
import logEvent from '@/lib/utils/logEvent';
import { RichTextOptions } from '@/lib/utils/richText';
import muiTheme from '@/styles/theme';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box } from '@mui/material';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Icon,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { storyblokEditable } from '@storyblok/react/rsc';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';

const containerStyle = {
  width: '100%',
  maxWidth: 725,
  marginBottom: 0,
  marginX: 'auto',
} as const;

const accordionDetail = {
  textAlign: 'left',
} as const;

const themes = {
  primary: {
    '&.MuiAccordion-root': {
      margin: 0,
      '&:before': {
        display: 'none',
      },
    },
  }, // uses default styling
  secondary: {
    backgroundColor: 'secondary.light',
  },
  default: {
    '& .MuiAccordionSummary-expandIconWrapper': { color: 'primary.dark' },
    backgroundColor: 'paleSecondaryLight',
  },
};

interface StoryblokAccordionItemProps {
  _uid: string;
  _editable: string;
  body: any;
  title: string;
  title_size: 'small' | 'large';
  icon: { filename: string; alt: string };
  accordion_id: string; // see storyblok datasource accordion_ids
}
interface StoryblokAccordionProps {
  _uid: string;
  _editable: string;
  accordion_items: Array<StoryblokAccordionItemProps>;
  theme: 'primary' | 'secondary';
}
const StoryblokAccordion = (props: StoryblokAccordionProps) => {
  const { _uid, _editable, accordion_items, theme } = props;
  const searchParams = useSearchParams();
  const isSmallScreen = useMediaQuery(muiTheme.breakpoints.down('md'));
  const headerOffset = isSmallScreen ? 48 : 136;

  const handleChange =
    (accordionTitle: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      if (isExpanded) {
        logEvent(ACCORDION_OPENED, { accordionTitle: accordionTitle });
        logEvent(generateAccordionEvent(accordionTitle), {
          accordionTitle: accordionTitle,
        });
      }
    };
  const scrollRef = useRef(null);
  const accordionInUrl = searchParams?.get('openacc') ?? undefined;

  useEffect(() => {
    if (accordionInUrl && scrollRef.current) {
      const scrollToY =
        // @ts-ignore
        scrollRef.current.getBoundingClientRect().top + window.scrollY - headerOffset - 16;
      window.scrollTo({ top: scrollToY, behavior: 'smooth' });
      // @ts-ignore
    }
  }, [headerOffset, accordionInUrl]);

  return (
    <Box sx={containerStyle} {...storyblokEditable({ _uid, _editable, accordion_items, theme })}>
      {accordion_items.map((ai, i) => (
        <Accordion
          data-testid="accordion-item"
          id={ai.accordion_id ?? undefined}
          ref={ai.accordion_id === accordionInUrl ? scrollRef : undefined}
          key={`panel${i}`}
          defaultExpanded={accordionInUrl === ai.accordion_id}
          onChange={handleChange(ai.title)}
          sx={themes[theme]}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${i}-content`}
            id={`panel${i}-header`}
          >
            {ai.icon?.filename && (
              <Icon
                sx={{
                  position: 'relative',
                  fontSize: 32,
                  marginBottom: 0,
                  marginRight: 2,
                }}
              >
                <Image
                  alt={ai.icon.alt}
                  src={ai.icon.filename}
                  fill
                  sizes={getImageSizes(32)}
                  style={{
                    objectFit: 'contain',
                  }}
                />
              </Icon>
            )}
            {
              <Typography
                sx={{ marginBottom: 0, maxWidth: 800 }}
                component="h3"
                variant={ai.title_size === 'small' ? 'body1' : 'h3'}
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
