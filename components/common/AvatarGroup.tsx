'use client';

import { INLINE_ALIGNMENT } from '@/lib/utils/alignment';
import { Box } from '@mui/material';
import Image from 'next/image';

// Circular portraits arranged as a group: either a row that overlaps, or a loose cluster where the
// first portrait leads and the rest sit below it.

export interface Avatar {
  src: string;
  alt: string;
}

export type AvatarGroupSize = 'small' | 'medium' | 'large';
export type AvatarGroupLayout = 'row' | 'cluster';

const DIAMETER: Record<AvatarGroupSize, { xs: number; md: number }> = {
  small: { xs: 56, md: 72 },
  medium: { xs: 88, md: 108 },
  large: { xs: 100, md: 120 },
};

// Three equal portraits: one above two that sit tangent to each other. Any beyond the third fall
// back to the row layout.
const CLUSTER_PLACEMENT = [
  { top: '0%', insetInlineStart: '24%' },
  { top: '43%', insetInlineStart: '0%' },
  { top: '43%', insetInlineStart: '43%' },
];

const CLUSTER_WIDTH = 2.02;
const CLUSTER_HEIGHT = 1.76;

const rowStyle = (alignment: string) =>
  ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: INLINE_ALIGNMENT[alignment] ?? 'flex-start',
  }) as const;

const rowAvatarStyle = (size: AvatarGroupSize, index: number, overlap: boolean) =>
  ({
    position: 'relative',
    width: DIAMETER[size],
    height: DIAMETER[size],
    borderRadius: '50%',
    overflow: 'hidden',
    border: '3px solid',
    borderColor: 'common.white',
    marginInlineStart: index === 0 || !overlap ? 0 : { xs: -2, md: -3 },
    zIndex: 10 - index,
  }) as const;

// Sized from the leading circle, which the placements are percentages of.
const clusterStyle = (size: AvatarGroupSize, alignment: string) =>
  ({
    position: 'relative',
    width: { xs: DIAMETER[size].xs * CLUSTER_WIDTH, md: DIAMETER[size].md * CLUSTER_WIDTH },
    height: { xs: DIAMETER[size].xs * CLUSTER_HEIGHT, md: DIAMETER[size].md * CLUSTER_HEIGHT },
    marginInlineStart: alignment === 'center' || alignment === 'right' ? 'auto' : 0,
    marginInlineEnd: alignment === 'center' ? 'auto' : 0,
  }) as const;

const clusterAvatarStyle = (size: AvatarGroupSize, index: number) => {
  const { top, insetInlineStart } = CLUSTER_PLACEMENT[index];
  return {
    position: 'absolute',
    top,
    insetInlineStart,
    width: DIAMETER[size],
    height: DIAMETER[size],
    borderRadius: '50%',
    overflow: 'hidden',
    border: '3px solid',
    borderColor: 'common.white',
    zIndex: 10 - index,
  } as const;
};

export function AvatarGroup({
  avatars,
  size = 'medium',
  alignment = 'left',
  layout = 'row',
  overlap = true,
  qaId,
}: {
  avatars: Avatar[];
  size?: AvatarGroupSize;
  alignment?: string;
  layout?: AvatarGroupLayout;
  overlap?: boolean;
  qaId?: string;
}) {
  if (!avatars.length) return null;

  const isCluster = layout === 'cluster' && avatars.length <= CLUSTER_PLACEMENT.length;

  return (
    <Box
      qa-id={qaId}
      data-layout={isCluster ? 'cluster' : 'row'}
      sx={isCluster ? clusterStyle(size, alignment) : rowStyle(alignment)}
    >
      {avatars.map((avatar, index) => (
        <Box
          key={`${avatar.src}-${index}`}
          sx={isCluster ? clusterAvatarStyle(size, index) : rowAvatarStyle(size, index, overlap)}
        >
          <Image
            alt={avatar.alt}
            src={avatar.src}
            fill
            sizes={`${DIAMETER[size].md}px`}
            style={{ objectFit: 'cover' }}
          />
        </Box>
      ))}
    </Box>
  );
}
