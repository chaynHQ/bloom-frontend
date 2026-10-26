// Extract video ID from various YouTube URL formats
export const getYouTubeVideoId = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    const allowedYouTubeHostnames = [
      'youtu.be',
      'youtube.com',
      'www.youtube.com',
      'm.youtube.com',
      'youtube-nocookie.com',
      'www.youtube-nocookie.com',
    ];

    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1);
    }

    if (allowedYouTubeHostnames.includes(parsed.hostname)) {
      return parsed.searchParams.get('v');
    }
  } catch {
    // Invalid URL
  }
  return null;
};
