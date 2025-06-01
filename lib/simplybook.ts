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
