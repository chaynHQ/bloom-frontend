'use client';

import { Link as i18nLink } from '@/i18n/routing';
import { BASE_URL } from '@/lib/constants/common';
import { getImageSizes } from '@/lib/utils/imageSizes';
import { RichTextOptions } from '@/lib/utils/richText';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Collapse,
  IconButton,
  Typography,
} from '@mui/material';
import { ISbRichtext, storyblokEditable } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';

interface StoryblokCardProps {
  _uid: string;
  _editable: string;
  image: { filename: string; alt: string };
  content: ISbRichtext;
  alignment: string;
  background: string;
  style: string;
  dropdown_button?: boolean;
  dropdown_content?: ISbRichtext;
  card_link?: { url: string; cached_url: string };
}

const cardActionsStyle = {
  position: 'absolute',
  right: 1,
  bottom: 3,
} as const;

const cardStyle = {
  '&:first-of-type': {
    marginTop: 0,
  },
};

const StoryblokCard = (props: StoryblokCardProps) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const {
    _uid,
    _editable,
    image,
    content,
    alignment = 'left',
    background = 'common.white',
    style = 'default',
    dropdown_button = false,
    dropdown_content,
    card_link,
  } = props;

  const t = useTranslations('Courses');
  const tS = useTranslations('Shared');

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const isSlimStyle = style === 'slim';

  const arrowStyle = {
    transform: expanded ? 'rotate(180deg)' : 'none',
  } as const;

  const slimPadding = {
    padding: { xs: 2, sm: 2, md: 2, lg: 2 },
    ...(dropdown_button ? { paddingRight: { xs: 2, sm: 2, md: 4, lg: 2 } } : {}),
    '&:last-child': { paddingBottom: { xs: 2, sm: 2, md: 2, lg: 2 } },
    gap: { xs: 3, sm: 1, md: 1 },
    '& h3:only-child': {
      marginBottom: 0,
    },
  };

  const cardContentStyle = {
    ...(isSlimStyle && slimPadding),
    display: 'flex',
    flexDirection:
      alignment === 'right' ? 'row-reverse' : alignment === 'center' ? 'column' : 'row',
    alignItems: alignment === 'right' ? 'flex-end' : alignment === 'center' ? 'center' : 'center',
    textAlign: alignment === 'right' ? 'right' : alignment === 'center' ? 'center' : 'left',
    gap: isSlimStyle ? 2 : 3,
    backgroundColor: background,
  } as const;

  const imageContainerStyle = {
    position: 'relative',
    width: 84,
    height: 84,
    minWidth: 84,
    minHeight: 84,
  } as const;

  const collapseContentStyle = {
    backgroundColor: background,
    textAlign: alignment === 'right' ? 'right' : alignment === 'center' ? 'center' : 'left',
    ...(style == 'slim' ? slimPadding : {}),
  } as const;

  const CardMainContent = () => (
    <CardContent sx={cardContentStyle}>
      {image && image.filename && (
        <Box sx={imageContainerStyle}>
          <Image
            src={image.filename}
            alt={image.alt}
            className="image"
            fill
            sizes={getImageSizes(imageContainerStyle.width)}
          ></Image>
        </Box>
      )}
      <Box maxWidth={700}>{render(content, RichTextOptions)}</Box>
    </CardContent>
  );

  return (
    <Card
      {...storyblokEditable({ _uid, _editable, image, content, alignment, background, style })}
      sx={cardStyle}
    >
      <Box sx={{ position: 'relative' }}>
        {card_link?.cached_url ? (
          <CardActionArea
            component={card_link.cached_url.startsWith(BASE_URL || '/') ? i18nLink : 'a'}
            href={card_link.cached_url}
            aria-label={`${tS('navigateTo')} ${card_link.cached_url}`}
          >
            <CardMainContent />
          </CardActionArea>
        ) : (
          <CardMainContent />
        )}
        {dropdown_button && (
          <CardActions sx={cardActionsStyle}>
            <IconButton
              sx={{ marginLeft: 'auto' }}
              aria-label={`${t('expandSummary')}`}
              onClick={handleExpandClick}
              size="small"
            >
              <KeyboardArrowDownIcon sx={arrowStyle} color="error" />
            </IconButton>
          </CardActions>
        )}
      </Box>
      {dropdown_button && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent sx={collapseContentStyle}>
            <Typography>{render(dropdown_content, RichTextOptions)}</Typography>
          </CardContent>
        </Collapse>
      )}
    </Card>
  );
};

export default StoryblokCard;
