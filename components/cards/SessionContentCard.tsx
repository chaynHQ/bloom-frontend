'use client';

import logEvent from '@/lib/utils/logEvent';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import { Box, ButtonBase, Collapse, Typography } from '@mui/material';
import { ReactNode, useId, useState } from 'react';

const cardStyle = {
  borderRadius: '16px',
  border: '1px solid',
  borderColor: 'cardBorder',
  backgroundColor: 'cardSurface',
  overflow: 'hidden',
  transition: 'border-color 150ms ease',
  '&:hover': { borderColor: 'secondary.dark' },
} as const;

// Hover washes the header in the brand tint; keyboard focus adds an inset ring, which the card's
// overflow clip cannot crop the way an outset one would. The open state is carried by the rotated
// chevron and the body's top rule rather than a third background colour.
const headerStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 2,
  width: '100%',
  p: 2,
  textAlign: 'start',
  transition: 'background-color 150ms ease',
  '&:hover': { backgroundColor: 'primary.light' },
  '&.Mui-focusVisible': {
    outline: '2px solid',
    outlineColor: 'primary.dark',
    outlineOffset: '-2px',
    backgroundColor: 'primary.light',
  },
} as const;

// Height is left to the content: a fixed 20px box clips descenders and Arabic diacritics.
const badgeStyle = {
  display: 'inline-block',
  mb: 1,
  px: 1,
  py: 0.25,
  borderRadius: '8px',
  backgroundColor: 'chipBackground',
  fontFamily: 'headingFontFamily',
  fontSize: '0.875rem',
  fontWeight: 500,
  lineHeight: 1.4,
  color: 'grey.800',
} as const;

const chevronStyle = (expanded: boolean) =>
  ({
    flexShrink: 0,
    mt: 0.5,
    color: 'primary.dark',
    transition: 'transform 200ms ease',
    transform: expanded ? 'rotate(180deg)' : 'none',
  }) as const;

const bodyStyle = {
  px: 2,
  pt: 2,
  pb: 2,
  borderTop: '1px solid',
  borderColor: 'cardBorder',
} as const;

interface SessionContentCardProps {
  title: string;
  badge?: string;
  children: ReactNode;
  eventPrefix: string;
  eventData: { [key: string]: any };
  initialExpanded?: boolean;
  qaId?: string;
}

const SessionContentCard = ({
  title,
  badge,
  children,
  eventPrefix,
  eventData,
  initialExpanded = false,
  qaId,
}: SessionContentCardProps) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  const bodyId = useId();

  const handleToggle = () => {
    setExpanded(!expanded);
    logEvent(`${eventPrefix}_${!expanded ? 'EXPANDED' : 'COLLAPSED'}`, eventData);
  };

  return (
    <Box qa-id={qaId} sx={cardStyle}>
      <ButtonBase
        disableRipple
        onClick={handleToggle}
        aria-expanded={expanded}
        aria-controls={bodyId}
        sx={headerStyle}
      >
        <Box>
          {badge && (
            <Typography component="span" sx={badgeStyle}>
              {badge}
            </Typography>
          )}
          <Typography variant="h3" component="h2" sx={{ mb: 0, fontWeight: 400 }}>
            {title}
          </Typography>
        </Box>
        <ExpandMoreRounded sx={chevronStyle(expanded)} />
      </ButtonBase>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box id={bodyId} sx={bodyStyle}>
          {children}
        </Box>
      </Collapse>
    </Box>
  );
};

export default SessionContentCard;
