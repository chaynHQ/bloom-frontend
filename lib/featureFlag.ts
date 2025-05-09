export namespace FeatureFlag {
  export const isUserResearchBannerEnabled = () => {
    return process.env.NEXT_PUBLIC_FF_USER_RESEARCH_BANNER?.toLowerCase() === 'true';
  };

  export const isFruitzRetirementBannerEnabled = () => {
    return process.env.NEXT_PUBLIC_FRUITZ_RETIRE_BANNER_ENABLED?.toLowerCase() === 'true';
  };
}
