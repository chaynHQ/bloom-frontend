import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Collapse,
  IconButton,
  Link,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import { ISbRichtext, storyblokEditable } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import Image from 'next/legacy/image';
import { useState } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';
import { RichTextOptions } from '../../utils/richText';

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
  card_link?: { url: string };
}

const cardActionsStyle = {
  position: 'absolute',
  right: 1,
  bottom: 3,
} as const;

const slimImageStyle = {
  width: { xs: 80, sm: 80, md: 80 },
  height: { xs: 80, sm: 80, md: 80 },
  minWidth: { xs: 80, sm: 80, md: 80 },
  minHeight: { xs: 80, sm: 80, md: 80 },
};
const defaultStyle = {
  width: { xs: 80, md: 100 },
  height: { xs: 80, md: 100 },
  minWidth: { xs: 80, md: 100 },
  minHeight: { xs: 80, md: 100 },
};

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
    ...(style == 'slim' ? slimPadding : {}),
    display: 'flex',
    flexDirection:
      alignment === 'right' ? 'row-reverse' : alignment === 'center' ? 'column' : 'row',
    alignItems: alignment === 'right' ? 'flex-end' : alignment === 'center' ? 'center' : 'center',
    textAlign: alignment === 'right' ? 'right' : alignment === 'center' ? 'center' : 'left',
    gap: 3,
    backgroundColor: background,
  } as const;

  const imageContainerStyle = {
    ...(style == 'slim' ? slimImageStyle : defaultStyle),
    position: 'relative',
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
          <Image src={image.filename} alt={image.alt} layout="fill" className="image"></Image>
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
        {card_link?.url ? (
          <CardActionArea
            component={Link}
            href={card_link.url}
            aria-label={`${tS('navigateTo')} ${card_link.url}`}
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
