import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  Card,
  CardActionArea,
  CardContent,
  Collapse,
  SvgIconTypeMap,
  Typography,
} from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { rowStyle } from '../../styles/common';
import logEvent from '../../utils/logEvent';

const cardStyle = {
  width: { xs: '100%', md: 700 },
  marginTop: 0,
  backgroundColor: 'background.default',
} as const;

interface SessionContentCardProps {
  children: any;
  title: string;
  titleIcon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
  titleIconSize?: number;
  richtextContent?: boolean;
  eventPrefix: string;
  eventData: {};
}

const SessionContentCard = (props: SessionContentCardProps) => {
  const {
    children,
    title,
    titleIcon,
    titleIconSize = 28,
    richtextContent = false,
    eventPrefix,
    eventData,
  } = props;
  const t = useTranslations('Courses');
  const TitleIcon = titleIcon;
  eventPrefix;
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
    logEvent(`${eventPrefix}_${!expanded ? 'EXPANDED' : 'COLLAPSED'}`, eventData);
  };

  const titleIconStyle = {
    width: { xs: titleIconSize, md: titleIconSize + 4 },
    height: { xs: titleIconSize, md: titleIconSize + 4 },
  } as const;

  const contentContainerStyle = {
    paddingY: richtextContent ? '1rem !important' : '2rem !important',
  } as const;

  const titleContainerStyle = {
    ...rowStyle,
    alignItems: 'center',
    gap: 1.5,
    paddingY: { xs: '1rem !important', md: '1.25rem !important' },
    bgcolor: expanded ? 'primary.light' : 'none',
  } as const;

  const arrowStyle = {
    width: { xs: 26, md: 30 },
    height: { xs: 26, md: 30 },
    transform: expanded ? 'rotate(180deg)' : 'none',
  } as const;

  return (
    <Card sx={cardStyle} key={''}>
      <CardActionArea onClick={handleExpandClick} aria-label={`${t('expand')} ${title}`}>
        <CardContent sx={titleContainerStyle}>
          <TitleIcon sx={titleIconStyle} color="error" />
          <Typography component="h3" variant="h3" mb={0} flex={1}>
            {title}
          </Typography>
          <KeyboardArrowDownIcon sx={arrowStyle} color="error" />
        </CardContent>
      </CardActionArea>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={contentContainerStyle}>{children}</CardContent>
      </Collapse>
    </Card>
  );
};

export default SessionContentCard;
