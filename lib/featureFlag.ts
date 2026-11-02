export namespace FeatureFlag {
  export const isUserResearchBannerEnabled = () => {
    return process.env.NEXT_PUBLIC_FF_USER_RESEARCH_BANNER?.toLowerCase() === 'true';
  };

  export const isRedesignNewsBannerEnabled = () => {
    return process.env.NEXT_PUBLIC_FF_REDESIGN_NEWS_BANNER?.toLowerCase() === 'true';
  };

  // Sends the course a piece is opened in, so starting it there starts the course. Off: progress is
  // recorded per piece only.
  export const isCourseProgressEnabled = () => {
    return process.env.NEXT_PUBLIC_FF_COURSE_PROGRESS?.toLowerCase() === 'true';
  };

  export const isFruitzRetirementBannerEnabled = () => {
    return process.env.NEXT_PUBLIC_FRUITZ_RETIRE_BANNER_ENABLED?.toLowerCase() === 'true';
  };
}
