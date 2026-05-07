import { ENVIRONMENT } from '@/lib/constants/common';
import { ENVIRONMENTS } from '@/lib/constants/enums';
import { User } from '@/lib/store/userSlice';

// Simplybook hardcodes additional field IDs
const userIdFieldId =
  ENVIRONMENT === ENVIRONMENTS.PRODUCTION
    ? '86a541b6d059de75eaba4e18a288cd24'
    : 'b3b2455c79e69e6baf6e8c1fcf34b691';

export const getSimplybookWidgetConfig = (user?: User) => {
  return {
    container_id: 'simplybook-widget-container',
    widget_type: 'iframe',
    url: process.env.NEXT_PUBLIC_SIMPLYBOOK_WIDGET_URL,
    theme: 'dainty',
    theme_settings: {
      timeline_show_end_time: '1',
      timeline_hide_unavailable: '1',
      hide_past_days: '0',
      hide_img_mode: '0',
    },
    timeline: 'modern',
    datepicker: 'top_calendar',
    is_rtl: false,
    app_config: {
      allow_switch_to_ada: 0,
      ...(user && {
        // NOTE: user_id pre-fill is currently broken.
        // The user_id intake field is set to "not visible" in Simplybook admin,
        // which causes Simplybook to drop it from the form submission entirely —
        // the predefined value is never passed through to the booking payload.
        // Making the field visible fixes it, but exposes a raw UUID to the user.
        //
        // Also note: the predefined format here (object with client/fields keys)
        // differs from Simplybook's own generated snippet which uses an empty array —
        // the correct array format for v2 is unconfirmed; check with Simplybook support.
        //
        // Possible workarounds:
        // 1. Look up user by email on the backend — Simplybook always submits the client
        //    email, and it is pre-filled below. Requires email to be unique per user.
        // 2. Pre-fill with the user's active therapy access code instead of user_id —
        //    users are familiar with this value so a visible field wouldn't be confusing.
        //    Requires a reliable way to select one code when a user has multiple active ones.
        predefined: {
          client: {
            name: user.name,
            email: user.email,
          },
          fields: {
            [userIdFieldId]: user.id,
          },
        },
      }),
    },
  } as const;
};
