'use client';

import { LibraryCard } from '@/components/library/LibraryCard';
import { type LibraryItem } from '@/lib/utils/libraryData';
import { sectionDivider } from '@/styles/common';
import { Box, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'pageBackground',
  ...sectionDivider('top'),
} as const;

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
  gap: 3,
  mt: 3,
} as const;

interface OtherCoursesProps {
  courses: LibraryItem[];
  onCourseSelect: (course: LibraryItem, index: number) => void;
}

export function OtherCourses({ courses, onCourseSelect }: OtherCoursesProps) {
  const t = useTranslations('Courses');

  if (courses.length === 0) return null;

  return (
    <Container qa-id="other-courses" sx={containerStyle}>
      <Typography variant="h2" component="h2" sx={{ mb: 0 }}>
        {t('courseDetail.otherCoursesTitle')}
      </Typography>
      <Box sx={gridStyle}>
        {courses.map((course, index) => (
          <LibraryCard
            key={course.id}
            item={course}
            layout="illustrated"
            onSelect={() => onCourseSelect(course, index)}
          />
        ))}
      </Box>
    </Container>
  );
}
