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
import { rowStyle } from '../styles/common';

interface SessionContentCardProps {
  children: any;
  title: string;
  titleIcon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
  titleIconSize?: number;
  richtextContent?: boolean;
}

const cardStyle = {
  width: { xs: '100%', md: 700 },
  backgroundColor: 'background.default',
} as const;

const rowStyles = {
  ...rowStyle,
  alignItems: 'center',
  gap: 1.5,
} as const;

const SessionContentCard = (props: SessionContentCardProps) => {
  const { children, title, titleIcon, titleIconSize = 28, richtextContent = false } = props;
  const t = useTranslations('Courses');
  const TitleIcon = titleIcon;
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const titleIconStyle = {
    width: { xs: titleIconSize, md: titleIconSize + 4 },
    height: { xs: titleIconSize, md: titleIconSize + 4 },
  } as const;

  const collapseContainerStyle = {
    paddingTop: `${richtextContent ? '0.25rem' : '1.25rem'} !important`,
  } as const;

  const titleContainerStyle = {
    paddingTop: '1.25rem !important',
    paddingBottom: '1.25rem !important',
    bgcolor: expanded ? 'primary.light' : 'none',
  } as const;

  return (
    <Card sx={cardStyle} key={''}>
      <CardActionArea onClick={handleExpandClick}>
        <CardContent sx={{ ...titleContainerStyle, ...rowStyles }}>
          <TitleIcon sx={titleIconStyle} color="error" />
          <Typography component="h3" variant="h3" mb={0} flex={1}>
            {title}
          </Typography>
          <KeyboardArrowDownIcon sx={titleIconStyle} color="error" />
        </CardContent>
      </CardActionArea>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={collapseContainerStyle}>{children}</CardContent>
      </Collapse>
    </Card>
  );
};

export default SessionContentCard;
