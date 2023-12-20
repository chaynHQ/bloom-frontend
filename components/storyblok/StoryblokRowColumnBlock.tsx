import { render } from 'storyblok-rich-text-react-renderer';
import { RichTextOptions } from '../../utils/richText';
import Column from '../common/Column';
import Row from '../common/Row';
import { StoryblokColumn } from './StoryblokTypes';

/**
 * This React component is intended to display the "row_column_block" storyblok component.
 * The "StoryblokRow" React component is intended to display the "row" storyblok component.
 * The latter accepts the "column" prop of type RichText but the former only accepts "column" prop of
 * type "StoryblokColumn[]".
 *
 * This component has better styling and should be used where possible. The Storyblok CMS will
 * be updated to replace all "row" component usage to "row_column_block" in the future.
 *
 * See link for more detail (https://www.notion.so/chayn/Create-new-parallel-StoryblokRowBlockOnly-b9ff8aeffdbe4180a48002927899c187).
 */

interface StoryblokRowColumnBlockProps {
  columns: StoryblokColumn[];
  horizontal_alignment: string;
  vertical_alignment: string;
  gap: string;
}

const StoryblokRowColumnBlock = (props: StoryblokRowColumnBlockProps) => {
  const { columns, horizontal_alignment, vertical_alignment, gap } = props;

  if (!columns) return <></>;

  return (
    <Row
      numberOfColumns={columns.length}
      verticalAlignment={vertical_alignment}
      horizontalAlignment={horizontal_alignment}
      gap={gap}
    >
      {columns.map((column: any, index: number) => {
        return (
          <Column width={column.width} horizontalAlignment={column.horizontal_alignment} key={`row_column_${index}_${Math.random() * 100}`}>
            {render(column.content, RichTextOptions)}
          </Column>
        );
      })}
    </Row>
  );
};

export default StoryblokRowColumnBlock;
