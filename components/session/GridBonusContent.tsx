import LinkIcon from '@mui/icons-material/Link';
import Box from '@mui/material/Box';
import { useTranslations } from 'next-intl';
import { StoryData } from 'storyblok-js-client';
import { render } from 'storyblok-rich-text-react-renderer';
import { columnStyle } from '../../styles/common';
import { RichTextOptions } from '../../utils/richText';
import SessionContentCard from '../cards/SessionContentCard';
import { Dots } from '../common/Dots';

const bonusGridColumnStyle = {
  ...columnStyle,
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: 2,
  width: { xs: '100%', sm: '100%', md: 700 },
} as const;

export const bonusGridRowStyle = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  flexWrap: 'wrap',
  gap: 2,
  width: '100%',
} as const;

interface GridBonusContentProps {
  story: StoryData;
  eventData: { [index: string]: any };
}

const GridBonusContent = (props: GridBonusContentProps) => {
  const { story, eventData } = props;

  const t = useTranslations('Courses');

  return (
    <>
      {story.content.bonus &&
        story.content.bonus.length === 1 &&
        displayCentralBonusContent(story.content.bonus[0].content)}

      {story.content.bonus &&
        story.content.bonus.length > 1 &&
        displayGridBonusContent(story.content.bonus)}
    </>
  );

  function displayCentralBonusContent(bonusBlock: any, index?: number) {
    return (
      <>
        <Dots />
        {displayBonusContent(bonusBlock, index)}
      </>
    );
  }

  function displayGridBonusContent(bonusBlocks: any[]) {
    return (
      <>
        <Dots />
        <Box sx={bonusGridRowStyle}>
          <Box sx={bonusGridColumnStyle}>
            {bonusBlocks?.map((bonusBlock, index) => {
              if (index % 2 === 1) return;

              return displayBonusContent(bonusBlock.content, index);
            })}
          </Box>
          <Box sx={bonusGridColumnStyle}>
            {bonusBlocks?.map((bonusBlock, index) => {
              if (index % 2 === 0) return;
              return displayBonusContent(bonusBlock.content, index);
            })}
          </Box>
        </Box>
      </>
    );
  }

  function displayBonusContent(bonusBlock: any, index?: number) {
    return (
      <>
        <SessionContentCard
          title={t('sessionDetail.bonusTitle') + index}
          titleIcon={LinkIcon}
          richtextContent
          eventPrefix="SESSION_BONUS_CONTENT"
          eventData={eventData}
        >
          <>{render(bonusBlock, RichTextOptions)}</>
        </SessionContentCard>
      </>
    );
  }
};

export default GridBonusContent;
