import { ISbStoryData } from '@storyblok/react/rsc';
import { useMemo } from 'react';
import { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

/**
 * Recursively processes Storyblok richtext content and replaces {partnerName} placeholders
 */
function replacePartnerNameInRichtext(
  content: StoryblokRichtext | any,
  partnerName: string,
): StoryblokRichtext | any {
  if (!content) return content;

  // Handle arrays (common in Storyblok content structure)
  if (Array.isArray(content)) {
    return content.map((item) => replacePartnerNameInRichtext(item, partnerName));
  }

  // Handle objects
  if (typeof content === 'object') {
    const processed: any = { ...content };

    // Replace in text content
    if (processed.type === 'text' && typeof processed.text === 'string') {
      processed.text = processed.text.replace(/\{partnerName\}/g, partnerName);
    }

    // Recursively process nested content
    if (processed.content) {
      processed.content = replacePartnerNameInRichtext(processed.content, partnerName);
    }

    // Process other nested structures
    Object.keys(processed).forEach((key) => {
      if (key !== 'content' && typeof processed[key] === 'object') {
        processed[key] = replacePartnerNameInRichtext(processed[key], partnerName);
      }
    });

    return processed;
  }

  // Handle strings
  if (typeof content === 'string') {
    return content.replace(/\{partnerName\}/g, partnerName);
  }

  return content;
}

/**
 * Custom hook to process Storyblok story content and replace {partnerName} placeholders
 * with the actual partner name. This processes the data before rendering, ensuring
 * React-appropriate behavior and efficient memoization.
 *
 * @param story - The Storyblok story data to process
 * @param partnerName - The partner name to replace {partnerName} with (optional)
 * @returns The processed story with all {partnerName} placeholders replaced
 *
 * @example
 * ```tsx
 * const processedStory = useStoryblokWithPartnerName(story, partnerAccess?.partner.name);
 * ```
 */
export default function useStoryblokWithPartnerName(
  story: ISbStoryData | undefined,
  partnerName: string | undefined,
): ISbStoryData | undefined {
  const processedStory = useMemo(() => {
    if (!story || !partnerName) return story;

    return {
      ...story,
      content: {
        ...story.content,
        // Replace in description/introduction
        description: replacePartnerNameInRichtext(story.content.description, partnerName),
        // Replace in page sections
        page_sections: story.content.page_sections?.map((section: any) => ({
          ...section,
          content: replacePartnerNameInRichtext(section.content, partnerName),
        })),
      },
    };
  }, [story, partnerName]);

  return processedStory;
}
