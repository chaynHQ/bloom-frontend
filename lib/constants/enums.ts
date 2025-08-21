export enum LANGUAGES {
  en = 'en',
  es = 'es',
  hi = 'hi',
  fr = 'fr',
  pt = 'pt',
  de = 'de',
}

export enum MAINTENANCE_MODE {
  ON = 'on',
  OFF = 'off',
}

export enum COURSE_CATEGORIES {
  COURSE = 'course',
  SESSION = 'session',
  SESSION_IBA = 'session_iba',
}

export enum RESOURCE_CATEGORIES {
  SHORT_VIDEO = 'short_video',
  SINGLE_VIDEO = 'single_video',
  CONVERSATION = 'resource_conversation',
}

export enum EXERCISE_CATEGORIES {
  GROUNDING = 'grounding',
  ACTIVITIES = 'activities',
}

export type RELATED_CONTENT_CATEGORIES =
  | RESOURCE_CATEGORIES
  | COURSE_CATEGORIES
  | EXERCISE_CATEGORIES;

export enum EMAIL_REMINDERS_FREQUENCY {
  TWO_WEEKS = 'TWO_WEEKS',
  ONE_MONTH = 'ONE_MONTH',
  TWO_MONTHS = 'TWO_MONTHS',
  NEVER = 'NEVER',
}

export enum PARTNER_ACCESS_FEATURES {
  THERAPY = 'therapy',
}

export enum STORYBLOK_STORY_STATUS {
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
  DELETED = 'deleted',
}

export enum SIMPLYBOOK_ACTION_ENUM {
  NEW_BOOKING = 'NEW_BOOKING',
  CANCELLED_BOOKING = 'CANCELLED_BOOKING',
  UPDATED_BOOKING = 'UPDATED_BOOKING',
  COMPLETED_BOOKING = 'COMPLETED_BOOKING', // currently not in use as no webhook available - could be updated in cron job
}

export enum PARTNER_ACCESS_CODE_STATUS {
  VALID = 'VALID',
  INVALID_CODE = 'INVALID_CODE',
  DOES_NOT_EXIST = 'DOES_NOT_EXIST',
  ALREADY_IN_USE = 'ALREADY_IN_USE',
  ALREADY_APPLIED = 'ALREADY_APPLIED',
  CODE_EXPIRED = 'CODE_EXPIRED',
}

export enum WHATSAPP_SUBSCRIPTION_STATUS {
  ALREADY_EXISTS = 'ALREADY_EXISTS',
}

export enum PROGRESS_STATUS {
  STARTED = 'Started',
  COMPLETED = 'Completed',
  NOT_STARTED = 'Not started',
}

export enum STORYBLOK_COLORS {
  PRIMARY_LIGHT = 'primary.light',
  PRIMARY_DARK = 'primary.dark',
  SECONDARY_LIGHT = 'secondary.light',
  SECONDARY_MAIN = 'secondary.main',
  SECONDARY_DARK = 'secondary.dark',
  COMMON_WHITE = 'common.white',
  BACKGROUND_DEFAULT = 'background.default',
  BLOOM_GRADIENT = 'bloomGradient',
}

export enum STORYBLOK_REFERENCE_CATEGORIES {
  BOOK = 'book',
  ARTICLE = 'article',
  VIDEO_PRACTICES = 'video_practices',
}

export enum SURVEY_FORMS {
  default = 'default',
  a = 'a',
}

export enum ENVIRONMENTS {
  LOCAL = 'local',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

export enum EVENT_LOG_NAME {
  CHAT_MESSAGE_SENT = 'CHAT_MESSAGE_SENT',
  LOGGED_IN = 'LOGGED_IN',
  LOGGED_OUT = 'LOGGED_OUT',
  GROUNDING_EXERCISE_STARTED = 'GROUNDING_EXERCISE_STARTED',
}

export enum FEEDBACK_TAGS {
  RELATABLE = 'relatable',
  USEFUL = 'useful',
  INSPIRING = 'inspiring',
  TOO_LONG = 'too long',
  TOO_COMPLICATED = 'too complicated',
  NOT_USEFUL = 'not useful',
}
