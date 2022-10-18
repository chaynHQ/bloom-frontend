export enum LANGUAGES {
  en = 'en',
  es = 'es',
  hi = 'hi',
  fr = 'fr',
  pt = 'pt',
}

export enum PARTNER_ACCESS_FEATURES {
  COURSES = 'courses',
  LIVE_CHAT = 'live chat',
  THERAPY = 'therapy',
}

export enum STORYBLOK_STORY_STATUS {
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
  DELETED = 'deleted',
}

export enum PARTNER_ACCESS_CODE_STATUS {
  VALID = 'VALID',
  INVALID_CODE = 'INVALID_CODE',
  DOES_NOT_EXIST = 'DOES_NOT_EXIST',
  ALREADY_IN_USE = 'ALREADY_IN_USE',
  CODE_EXPIRED = 'CODE_EXPIRED',
}

export enum PROGRESS_STATUS {
  STARTED = 'Started',
  COMPLETED = 'Completed',
  NOT_STARTED = 'Not started',
}

export enum VIDEO_TYPES {
  COURSE_INTRO = 'COURSE_INTRO',
  SESSION = 'SESSION',
}

export enum STORYBLOK_COLORS {
  PRIMARY_LIGHT = 'primary.light',
  PRIMARY_DARK = 'primary.dark',
  SECONDARY_LIGHT = 'secondary.light',
  SECONDARY_DARK = 'secondary.dark',
  COMMON_WHITE = 'common.white',
  BACKGROUND_DEFAULT = 'background.default',
}

export enum SURVEY_FORMS {
  default = 'default',
  a = 'a',
  b = 'b',
  c = 'c',
}

export enum FORM_TRIGGERS {
  sessionFour = 'session-four',
}

export enum ENVIRONMENT {
  PRODUCTION = 'production',
  LOCAL = 'local',
  STAGING = 'staging',
}
