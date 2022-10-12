import { Box } from '@mui/system';
import { Richtext } from 'storyblok-js-client';
import { render } from 'storyblok-rich-text-react-renderer';
import { richtextContentStyle, rowStyle } from '../../styles/common';
import { RichTextOptions } from '../../utils/richText';
import { StoryblokBlok, StoryblokColumn } from './StoryblokTypes';

interface StoryblokRowProps {
  columns: StoryblokColumn | StoryblokColumn[] | Richtext;
  horizontal_alignment: string;
  vertical_alignment: string;
}

const columnStyles = (width: string | undefined) => ({
  width:
    width === 'extra-small'
      ? {
          xs: `20%`,
          md: '5%',
        }
      : width === 'small'
      ? { xs: '100%', md: '20%' }
      : width === 'medium'
      ? { xs: '100%', md: '40%' }
      : width === 'large'
      ? { xs: '100%', md: '60%' }
      : width === 'extra-large'
      ? { xs: '100%', md: '80%' }
      : { xs: `100%`, md: 'auto' },
  ...(!width && { flex: { md: 1 } }),
});

const getGap = (noColumns: number) => {
  return {
    gap: {
      xs: 3,
      sm: 8 / noColumns,
      md: 10 / noColumns,
      lg: 16 / noColumns,
    },
  };
};

const StoryblokRow = (props: StoryblokRowProps) => {
  const { columns, horizontal_alignment, vertical_alignment } = props;

  const columnArray = Array.isArray(columns) ? columns : [columns];

  if (!columnArray) return <></>;

  const rowStyles = {
    width: '100%',
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

  let numberOfColumns = 0;
  const renderedColumns = columnArray.map((col, index) => {
    // Sometimes col.content is an array and sometimes it isn't
    const contentIsObject = !Array.isArray(col.content);
    if (contentIsObject) {
      const storyblokColumn = col as StoryblokColumn;
      numberOfColumns++;
      return renderColumn(storyblokColumn.content, storyblokColumn.width.toString(), index);
    }
    return col.content.map((richTextContent: StoryblokBlok | StoryblokColumn, index2: number) => {
      // The render function from  storyblok-rich-text-react-renderer' expects an object that has a .type and .content
      // property. For some reason the type blok doesn't have that and it was not rendering it.
      if ('type' in richTextContent && richTextContent.type === 'blok') {
        let numberColumnsInBlock = 0;
        numberOfColumns++;

        const renderedBlokColumns = richTextContent.attrs.body.map((el: StoryblokColumn) => {
          numberColumnsInBlock++;
          return renderColumn(el.content, el.width.toString(), index2);
        });
        return (
          <Box sx={{ ...rowStyles, ...getGap(numberColumnsInBlock) }}>{renderedBlokColumns}</Box>
        );
      }
      numberOfColumns++;
      return 'width' in richTextContent ? (
        renderColumn(richTextContent, richTextContent.width.toString(), index2)
      ) : (
        <></>
      );
    });
  });
  return <Box sx={{ ...rowStyles, ...getGap(numberOfColumns) }}>{renderedColumns}</Box>;
};

const renderColumn = (content: any, width: string, index: number) => {
  return (
    <Box sx={columnStyles(width)} key={`row_column_${index}`}>
      {render(content, RichTextOptions)}
    </Box>
  );
};

export default StoryblokRow;
