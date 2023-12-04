import { Richtext } from 'storyblok-js-client';
import { render } from 'storyblok-rich-text-react-renderer';
import { RichTextOptions } from '../../utils/richText';
import Column from '../common/Column';
import Row from '../common/Row';
import { StoryblokBlok, StoryblokColumn } from './StoryblokTypes';

interface StoryblokRowProps {
  columns: StoryblokColumn | StoryblokColumn[] | Richtext;
  horizontal_alignment: string;
  vertical_alignment: string;
}

const StoryblokRow = (props: StoryblokRowProps) => {
  const { columns, horizontal_alignment, vertical_alignment } = props;

  const columnArray = Array.isArray(columns) ? columns : [columns];

  if (!columnArray) return <></>;

  let numberOfColumns = 0;
  const renderedColumns = columnArray.map((col, index) => {
    // Sometimes col.content is an array and sometimes it isn't
    const contentIsObject = !Array.isArray(col.content);
    if (contentIsObject) {
      const storyblokColumn = col as StoryblokColumn;
      numberOfColumns++;
      return renderColumn(storyblokColumn.content, index, storyblokColumn.width.toString());
    }
    return col.content.map((richTextContent: StoryblokBlok | StoryblokColumn, index2: number) => {
      // The render function from  storyblok-rich-text-react-renderer' expects an object that has a .type and .content
      // property. For some reason the type blok doesn't have that and it was not rendering it.
      if ('type' in richTextContent && richTextContent.type === 'blok') {
        let numberColumnsInBlock = 0;
        numberOfColumns++;

        const renderedBlokColumns = richTextContent.attrs.body.map((el: StoryblokColumn) => {
          numberColumnsInBlock++;
          return renderColumn(el.content, index2, el.width.toString());
        });
        return (
          <Row
            numberOfColumns={numberColumnsInBlock}
            verticalAlignment={vertical_alignment}
            horizontalAlignment={horizontal_alignment}
          >
            {renderedBlokColumns}
          </Row>
        );
      }
      numberOfColumns++;
      return 'width' in richTextContent ? (
        renderColumn(richTextContent, index2, richTextContent.width.toString())
      ) : (
        <></>
      );
    });
  });
  return (
    <Row
      numberOfColumns={numberOfColumns}
      horizontalAlignment={horizontal_alignment}
      verticalAlignment={vertical_alignment}
    >
      {renderedColumns}
    </Row>
  );
};

const renderColumn = (content: any, index: number, width?: string) => {
  return (
    <Column width={width} key={`row_column_${index}_${Math.random() * 100}`}>
      {render(content, RichTextOptions)}
    </Column>
  );
};

export default StoryblokRow;
