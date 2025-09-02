import { STORYBLOK_REFERENCE_CATEGORIES } from '@/lib/constants/enums';
import { rowStyle } from '@/styles/common';
import { Box, Link, List, ListItem, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { StoryblokReferenceProps } from '../storyblok/StoryblokTypes';
import { ReferenceIcon } from './ReferenceIcon';

const headingStyle = {
  ...rowStyle,
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: 1,
  mb: 0.75,
} as const;

const listStyle = {
  listStyleType: 'disc',
  pl: 3,
  pt: 0,
  pb: 0,
} as const;

const listItemStyle = {
  display: 'list-item',
  pl: 1,
  pt: 0,
  mb: 0,
} as const;

interface ReferencesCategoryProps {
  category: STORYBLOK_REFERENCE_CATEGORIES;
  references: StoryblokReferenceProps[];
}

const ReferencesCategory = (props: ReferencesCategoryProps) => {
  const { category, references } = props;

  const tS = useTranslations('Resources.references');
  const categoryString = tS(`${category}s`);

  return (
    <Box mb={2}>
      <Box sx={headingStyle}>
        <ReferenceIcon category={category} />
        <Typography variant="h4" component="h4" mb={0}>
          {categoryString}
        </Typography>
      </Box>
      <List sx={listStyle}>
        {references.map((reference, index) => (
          <ListItem key={`reference_cat_${index}`} sx={listItemStyle}>
            <Typography
              key={`reference_${reference.category}_${index}`}
              variant="body2"
              mb={0.75}
              fontStyle="italic"
            >
              {reference.url ? (
                <Link href={reference.url} target="_blank" rel="noopener noreferrer">
                  {reference.title}
                </Link>
              ) : (
                reference.title
              )}{' '}
              <Typography
                variant="body2"
                color="textSecondary"
                component="span"
                fontStyle="normal"
                ml={0.5}
              >
                {reference.attribution}
              </Typography>
            </Typography>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ReferencesCategory;
