import { Box } from '@mui/system';
import { render } from 'storyblok-rich-text-react-renderer';
import { rowStyle } from '../../styles/common';
import { RichTextOptions } from '../../utils/richText';

interface StoryblokRowProps {
  columns: any;
  horizontal_alignment: string;
  vertical_alignment: string;
}

const StoryblokRow = (props: StoryblokRowProps) => {
  const { columns, horizontal_alignment, vertical_alignment } = props;

  if (!columns) return <></>;

  const columnsLength = columns.length;
  const desktopGap =
    columnsLength === 5 ? 1 : columnsLength === 4 ? 1.5 : columnsLength === 3 ? 2 : 3; // in rem
  const mobileGap = 1.25; // in rem

  const rowStyles = {
    width: '100%',
    marginY: { xs: 4, md: 6 },
    gap: { xs: mobileGap * 2, md: desktopGap * 2 },
    ...rowStyle,
    ...(horizontal_alignment && {
      justifyContent:
        horizontal_alignment === 'center'
          ? 'center'
          : horizontal_alignment === 'right'
          ? 'flex-end'
          : 'flex-start',
      alignItems:
        vertical_alignment === 'center'
          ? 'center'
          : vertical_alignment === 'bottom'
          ? 'flex-end'
          : 'flex-start',
    }),
  } as const;

  const getDesktopWidth = (widthPercentage: number) => {
    return `calc(${widthPercentage}% - ${
      desktopGap * (widthPercentage / 100) * (columnsLength - 1) // remove gap width from raw percentage
    }rem)`;
  };

  return (
    <Box sx={rowStyles}>
      {columns.map((column: any, index: number) => {
        const columnStyles = {
          width:
            column.width === 'extra-small'
              ? {
                  xs: `calc(50% - ${mobileGap}rem)`,
                  md: getDesktopWidth(20),
                }
              : column.width === 'small'
              ? { xs: '100%', md: getDesktopWidth(40) }
              : column.width === 'medium'
              ? { xs: '100%', md: getDesktopWidth(50) }
              : column.width === 'large'
              ? { xs: '100%', md: getDesktopWidth(60) }
              : column.width === 'extra-large'
              ? { xs: '100%', md: getDesktopWidth(80) }
              : 'auto',
          ...(!column.width && { flex: 1 }),
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
