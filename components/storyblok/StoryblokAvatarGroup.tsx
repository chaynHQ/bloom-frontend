'use client';

import {
  AvatarGroup,
  type AvatarGroupLayout,
  type AvatarGroupSize,
} from '@/components/common/AvatarGroup';
import { Box } from '@mui/material';
import { storyblokEditable } from '@storyblok/react/rsc';

interface StoryblokAsset {
  id: number;
  filename: string;
  alt: string;
}

export interface StoryblokAvatarGroupProps {
  _uid: string;
  _editable: string;
  images: StoryblokAsset[];
  size: AvatarGroupSize;
  layout: AvatarGroupLayout;
  alignment: string;
  separate: boolean;
}

const StoryblokAvatarGroup = (props: StoryblokAvatarGroupProps) => {
  const {
    _uid,
    _editable,
    images,
    size = 'medium',
    layout = 'row',
    alignment = 'left',
    separate = false,
  } = props;

  const avatars = (images || [])
    .filter((image) => image?.filename)
    .map((image) => ({ src: image.filename, alt: image.alt || '' }));

  if (!avatars.length) return <></>;

  return (
    <Box {...storyblokEditable({ _uid, _editable, images, size, layout, alignment, separate })}>
      <AvatarGroup
        avatars={avatars}
        size={size}
        layout={layout}
        alignment={alignment}
        overlap={!separate}
        qaId="storyblok-avatar-group"
      />
    </Box>
  );
};

export default StoryblokAvatarGroup;
