'use client';

import Column from '@/components/common/Column';
import Row from '@/components/common/Row';
import { RichTextOptions } from '@/lib/utils/richText';
import { Box } from '@mui/material';
import { storyblokEditable } from '@storyblok/react/rsc';
import { render } from 'storyblok-rich-text-react-renderer';
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
  _uid: string;
  _editable: string;
  columns: StoryblokColumn[];
  horizontal_alignment: string;
  vertical_alignment: string;
  gap: string;
}

const StoryblokRowColumnBlock = (props: StoryblokRowColumnBlockProps) => {
  const { _uid, _editable, columns, horizontal_alignment, vertical_alignment, gap } = props;

  if (!columns) return <></>;

  return (
    <Box
      {...storyblokEditable({
        _uid,
        _editable,
        columns,
        horizontal_alignment,
        vertical_alignment,
        gap,
      })}
      width="100%"
    >
      <Row
        numberOfColumns={columns.length}
        verticalAlignment={vertical_alignment}
        horizontalAlignment={horizontal_alignment}
        gap={gap}
      >
        {columns.map((column: any, index: number) => {
          return (
            <Column
              width={column.width}
              horizontalAlignment={column.horizontal_alignment}
              key={`row_column_${index}_${column._uid}`}
            >
              {render(column.content, RichTextOptions)}
            </Column>
          );
        })}
      </Row>
    </Box>
  );
};

export default StoryblokRowColumnBlock;
