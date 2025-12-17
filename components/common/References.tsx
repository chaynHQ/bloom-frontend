import { rowStyle } from '@/styles/common';
import { Box, Link, Typography } from '@mui/material';
import { StoryblokReferenceProps } from '../storyblok/StoryblokTypes';
import { ReferenceIcon } from './ReferenceIcon';

const referenceContainer = {
  ...rowStyle,
  justifyContent: 'flex-start',
  flexWrap: 'nowrap !important',
  gap: 1,
  mb: 1,
} as const;

const attributionStyle = {
  ml: 1,
  color: 'text.secondary',
  fontStyle: 'normal',
} as const;

interface ReferencesProps {
  references: StoryblokReferenceProps[];
}

const References = (props: ReferencesProps) => {
  const { references } = props;

  return (
    <>
      {references.map((reference, index) => (
        <Box sx={referenceContainer} key={`key_reference_${index}`}>
          <ReferenceIcon category={reference.category} />
          <Typography variant="body2" fontStyle="italic">
            {reference.url ? (
              <Link href={reference.url} target="_blank">
                {reference.title}
              </Link>
            ) : (
              reference.title
            )}
            <Typography variant="body2" component="span" sx={attributionStyle}>
              {reference.attribution}
            </Typography>
          </Typography>
        </Box>
      ))}
    </>
  );
};

export default References;
