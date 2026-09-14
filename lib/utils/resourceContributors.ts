import { type Avatar } from '@/components/common/AvatarGroup';

interface StoryblokAsset {
  filename?: string;
  alt?: string;
}

// The optional `contributor_images` + `contributors_description` fields, shared by every resource
// type, render as a small avatar row with a caption only when both are set.
export function toResourceContributors(
  images: StoryblokAsset[] | undefined,
  description: string | undefined,
): { avatars: Avatar[]; caption: string } | undefined {
  const avatars = (images ?? [])
    .filter((image) => image?.filename)
    .map((image) => ({ src: image.filename as string, alt: image.alt ?? '' }));

  return avatars.length > 0 && description ? { avatars, caption: description } : undefined;
}
