/**
 * Horizontal alignment values shared by the Storyblok `page_section`, `row_new` and `row_column`
 * bloks. Along the inline axis this is `justify-content` on a row and `align-items` on a column.
 */
type ResponsiveAlignment = string | { xs: string; md: string };

export const INLINE_ALIGNMENT: Record<string, ResponsiveAlignment> = {
  center: 'center',
  right: 'flex-end',
  'mobile-left-desktop-center': { xs: 'flex-start', md: 'center' },
  'mobile-center-desktop-left': { xs: 'center', md: 'flex-start' },
};

export const TEXT_ALIGNMENT: Record<string, ResponsiveAlignment> = {
  center: 'center',
  right: 'end',
  'mobile-left-desktop-center': { xs: 'start', md: 'center' },
  'mobile-center-desktop-left': { xs: 'center', md: 'start' },
};
