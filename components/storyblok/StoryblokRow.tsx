import { Box } from '@mui/system';
import { render } from 'storyblok-rich-text-react-renderer';
import { richtextContentStyle, rowStyle } from '../../styles/common';
import { RichTextOptions } from '../../utils/richText';

interface StoryblokRowProps {
  columns: any;
  horizontal_alignment: string;
  vertical_alignment: string;
}

const StoryblokRow = (props: StoryblokRowProps) => {
  const { columns, horizontal_alignment, vertical_alignment } = props;

  if (!columns) return <></>;

  const rowStyles = {
    width: '100%',
    gap: { xs: 3, sm: 8 / columns.length, md: 10 / columns.length, lg: 16 / columns.length },
    ...rowStyle,
    textAlign:
      horizontal_alignment === 'center'
        ? 'center'
        : horizontal_alignment === 'right'
        ? 'right'
        : 'left',
    ...(horizontal_alignment && {
      justifyContent:
        horizontal_alignment === 'center'
          ? 'center'
          : horizontal_alignment === 'right'
          ? 'flex-end'
          : 'flex-start',
    }),
    ...(vertical_alignment && {
      alignItems:
        vertical_alignment === 'center'
          ? 'center'
          : vertical_alignment === 'bottom'
          ? 'flex-end'
          : 'flex-start',
    }),
    ...richtextContentStyle,
  } as const;

  return (
    <Box sx={rowStyles}>
      {columns.map((column: any, index: number) => {
        const columnStyles = {
          width:
            column.width === 'extra-small'
              ? {
                  xs: `20%`,
                  md: '5%',
                }
              : column.width === 'small'
              ? { xs: '100%', md: '20%' }
              : column.width === 'medium'
              ? { xs: '100%', md: '40%' }
              : column.width === 'large'
              ? { xs: '100%', md: '60%' }
              : column.width === 'extra-large'
              ? { xs: '100%', md: '80%' }
              : { xs: `100%`, md: 'auto' },
          ...(!column.width && { flex: { md: 1 } }),
        };
        return (
          <Box sx={columnStyles} key={`row_column_${index}`}>
            {render(column.content, RichTextOptions)}
          </Box>
        );
      })}
    </Box>
  );
};

export default StoryblokRow;
