export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_ERROR = 'LOGIN_ERROR';

export const GET_LOGIN_USER_REQUEST = 'GET_LOGIN_USER_REQUEST';
export const GET_LOGIN_USER_SUCCESS = 'GET_LOGIN_USER_SUCCESS';
export const GET_LOGIN_USER_ERROR = 'GET_LOGIN_USER_ERROR';

export const GET_AUTH_USER_REQUEST = 'GET_AUTH_USER_REQUEST';
export const GET_AUTH_USER_SUCCESS = 'GET_AUTH_USER_SUCCESS';
export const GET_AUTH_USER_ERROR = 'GET_AUTH_USER_ERROR';

export const RESET_PASSWORD_ERROR = 'RESET_PASSWORD_ERROR';
export const RESET_PASSWORD_REQUEST = 'RESET_PASSWORD_REQUEST';
export const RESET_PASSWORD_SUCCESS = 'RESET_PASSWORD_SUCCESS';

export const REGISTER_REQUEST = 'REGISTER_REQUEST';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const REGISTER_ERROR = 'REGISTER_ERROR';
export const REGISTER_FIREBASE_ERROR = 'REGISTER_FIREBASE_ERROR';

export const ABOUT_YOU_VIEWED = 'ABOUT_YOU_VIEWED';

export const ABOUT_YOU_DEMO_REQUEST = 'ABOUT_YOU_DEMO_REQUEST';
export const ABOUT_YOU_DEMO_SUCCESS = 'ABOUT_YOU_DEMO_SUCCESS';
export const ABOUT_YOU_DEMO_ERROR = 'ABOUT_YOU_DEMO_ERROR';

export const ABOUT_YOU_SETA_REQUEST = 'ABOUT_YOU_SETA_REQUEST';
export const ABOUT_YOU_SETA_SUCCESS = 'ABOUT_YOU_SETA_SUCCESS';
export const ABOUT_YOU_SETA_ERROR = 'ABOUT_YOU_SETA_ERROR';

export const ABOUT_YOU_SETB_REQUEST = 'ABOUT_YOU_SETB_REQUEST';
export const ABOUT_YOU_SETB_SUCCESS = 'ABOUT_YOU_SETB_SUCCESS';
export const ABOUT_YOU_SETB_ERROR = 'ABOUT_YOU_SETB_ERROR';

export const ABOUT_YOU_SETC_REQUEST = 'ABOUT_YOU_SETC_REQUEST';
export const ABOUT_YOU_SETC_SUCCESS = 'ABOUT_YOU_SETC_SUCCESS';
export const ABOUT_YOU_SETC_ERROR = 'ABOUT_YOU_SETC_ERROR';

export const SESSION_4_SURVEY_SKIPPED = 'SESSION_4_SURVEY_SKIPPED';
export const SIGNUP_SURVEY_SKIPPED = 'SIGNUP_SURVEY_SKIPPED';

export const SESSION_4_SURVEY_COMPLETED = 'SESSION_4_SURVEY_COMPLETED';
export const SIGNUP_SURVEY_COMPLETED = 'SIGNUP_SURVEY_COMPLETED';

export const VALIDATE_ACCESS_CODE_REQUEST = 'VALIDATE_ACCESS_CODE_REQUEST';
export const VALIDATE_ACCESS_CODE_SUCCESS = 'VALIDATE_ACCESS_CODE_SUCCESS';
export const VALIDATE_ACCESS_CODE_INVALID = 'VALIDATE_ACCESS_CODE_INVALID';
export const VALIDATE_ACCESS_CODE_ERROR = 'VALIDATE_ACCESS_CODE_ERROR';

export const ASSIGN_NEW_PARTNER_VIEWED = 'ASSIGN_NEW_PARTNER_VIEWED';
export const ASSIGN_NEW_PARTNER_ACCESS_REQUEST = 'ASSIGN_NEW_PARTNER_ACCESS_REQUEST';
export const ASSIGN_NEW_PARTNER_ACCESS_SUCCESS = 'ASSIGN_NEW_PARTNER_ACCESS_SUCCESS';
export const ASSIGN_NEW_PARTNER_ACCESS_ERROR = 'ASSIGN_NEW_PARTNER_ACCESS_ERROR';
export const ASSIGN_NEW_PARTNER_ACCESS_INVALID = 'ASSIGN_NEW_PARTNER_ACCESS_INVALID';

export const THERAPY_BOOKING_VIEWED = 'THERAPY_BOOKING_VIEWED';
export const THERAPY_BOOKING_OPENED = 'THERAPY_BOOKING_OPENED';
export const THERAPY_CONFIRMATION_VIEWED = 'THERAPY_CONFIRMATION_VIEWED';
export const THERAPY_FAQ_OPENED = 'THERAPY_FAQ_OPENED';

export const COURSE_LIST_VIEWED = 'COURSE_LIST_VIEWED';
export const COURSE_OVERVIEW_VIEWED = 'COURSE_OVERVIEW_VIEWED';

export const COURSE_INTRO_VIDEO_STARTED = 'COURSE_INTRO_VIDEO_STARTED';
export const COURSE_INTRO_VIDEO_PAUSED = 'COURSE_INTRO_VIDEO_PAUSED';
export const COURSE_INTRO_VIDEO_PLAYED = 'COURSE_INTRO_VIDEO_PLAYED';
export const COURSE_INTRO_VIDEO_FINISHED = 'COURSE_INTRO_VIDEO_FINISHED';

export const COURSE_INTRO_VIDEO_TRANSCRIPT_OPENED = 'COURSE_INTRO_TRANSCRIPT_OPENED';
export const COURSE_INTRO_VIDEO_TRANSCRIPT_CLOSED = 'COURSE_INTRO_TRANSCRIPT_CLOSED';

export const COURSE_STARTED = 'COURSE_STARTED';
export const COURSE_COMPLETE = 'COURSE_COMPLETE';

export const SESSION_VIEWED = 'SESSION_VIEWED';
export const SESSION_VIDEO_STARTED = 'SESSION_VIDEO_STARTED';
export const SESSION_VIDEO_PAUSED = 'SESSION_VIDEO_PAUSED';
export const SESSION_VIDEO_PLAYED = 'SESSION_VIDEO_PLAYED';
export const SESSION_VIDEO_FINISHED = 'SESSION_VIDEO_FINISHED';

export const SESSION_VIDEO_TRANSCRIPT_OPENED = 'SESSION_TRANSCRIPT_OPENED';
export const SESSION_VIDEO_TRANSCRIPT_CLOSED = 'SESSION_TRANSCRIPT_CLOSED';

export const SESSION_STARTED_REQUEST = 'SESSION_STARTED_REQUEST';
export const SESSION_STARTED_SUCCESS = 'SESSION_STARTED_SUCCESS';
export const SESSION_STARTED_ERROR = 'SESSION_STARTED_ERROR';

export const SESSION_COMPLETE_REQUEST = 'SESSION_COMPLETE_REQUEST';
export const SESSION_COMPLETE_SUCCESS = 'SESSION_COMPLETE_SUCCESS';
export const SESSION_COMPLETE_ERROR = 'SESSION_COMPLETE_ERROR';

export const SESSION_VIDEO_EXPANDED = 'SESSION_VIDEO_EXPANDED';
export const SESSION_VIDEO_COLLAPSED = 'SESSION_VIDEO_COLLAPSED';

export const SESSION_ACTIVITY_EXPANDED = 'SESSION_ACTIVITY_EXPANDED';
export const SESSION_ACTIVITY_COLLAPSED = 'SESSION_ACTIVITY_COLLAPSED';

export const SESSION_BONUS_CONTENT_EXPANDED = 'SESSION_BONUS_CONTENT_EXPANDED';
export const SESSION_BONUS_CONTENT_COLLAPSED = 'SESSION_BONUS_CONTENT_COLLAPSED';

export const SESSION_CHAT_BUTTON_CLICKED = 'SESSION_CHAT_BUTTON_CLICKED';

export const CHAT_STARTED = 'CHAT_STARTED';
export const FIRST_CHAT_STARTED = 'FIRST_CHAT_STARTED';
export const CHAT_MESSAGE_SENT = 'CHAT_MESSAGE_SENT';

export const FAQ_OPENED = 'FAQ_OPENED';
export const LEAVE_SITE_BUTTON_CLICKED = 'LEAVE_SITE_BUTTON_CLICKED';
export const SOCIAL_LINK_CLICKED = 'SOCIAL_LINK_CLICKED';
export const PARTNER_SOCIAL_LINK_CLICKED = 'PARTNER_SOCIAL_LINK_CLICKED';
export const MEET_THE_TEAM_VIEWED = 'MEET_THE_TEAM_VIEWED';
export const ABOUT_COURSES_VIEWED = 'ABOUT_COURSES_VIEWED';

// Admin events

export const CREATE_PARTNER_ACCESS_VIEWED = 'CREATE_PARTNER_ACCESS_VIEWED';
export const CREATE_PARTNER_ACCESS_REQUEST = 'CREATE_PARTNER_ACCESS_REQUEST';
export const CREATE_PARTNER_ACCESS_SUCCESS = 'CREATE_PARTNER_ACCESS_SUCCESS';
export const CREATE_PARTNER_ACCESS_ERROR = 'CREATE_PARTNER_ACCESS_ERROR';

// Deprecated

// Replaced by "GET_LOGIN_USER_XXX" and "GET_AUTH_USER_XXX"
export const GET_USER_REQUEST = 'GET_USER_REQUEST';
export const GET_USER_SUCCESS = 'GET_USER_SUCCESS';
export const GET_USER_ERROR = 'GET_USER_ERROR';
