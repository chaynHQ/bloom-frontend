import { Container } from '@mui/material';
import { STORYBLOK_COLORS } from '../../constants/enums';
import { columnStyle } from '../../styles/common';
import theme from '../../styles/theme';

interface PageSectionProps {
  children: any;
  color: STORYBLOK_COLORS;
  alignment: string;
}

const PageSection = (props: PageSectionProps) => {
  const { children, color, alignment } = props;
  const containerStyle = {
    ...columnStyle,
    ...(color && {
      backgroundColor: color,
      ...(color === STORYBLOK_COLORS.BLOOM_GRADIENT
        ? { backgroundImage: theme.palette.bloomGradient }
        : {}),
    }),
    ...(alignment && {
      alignItems:
        alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start',
    }),
    textAlign: alignment === 'center' ? 'center' : alignment === 'right' ? 'right' : 'left',
    ...(alignment === 'center' && {
      ' p': { marginX: 'auto' },
    }),
  } as const;

  return <Container sx={containerStyle}>{children}</Container>;
};

export default PageSection;
