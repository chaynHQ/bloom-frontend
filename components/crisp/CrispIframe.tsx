'use client';

import { ENVIRONMENT } from '@/lib/constants/common';
import { ENVIRONMENTS } from '@/lib/constants/enums';
import { CHAT_MESSAGE_COMPOSED, CHAT_MESSAGE_SENT, CHAT_VIEWED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent from '@/lib/utils/logEvent';
import { Box } from '@mui/material';

const iframeContainerStyle = {
  width: '100%',
  height: '450px',
  marginTop: { md: -2 },
  marginBottom: 3,
  maxHeight: '70vh',
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  borderTop: '4px solid white',
  overflow: 'hidden',
} as const;

const iframeStyle = {
  marginTop: -160,
  borderRadius: 16,
  maxHeight: 'calc(70vh + 158px)',
} as const;

export const CrispIframe = () => {
  const userEmail = useTypedSelector((state) => state.user.email);
  const userSignUpLanguage = useTypedSelector((state) => state.user.signUpLanguage);
  const userCrispTokenId = useTypedSelector((state) => state.user.crispTokenId);

  const iframeLoaded = async () => {
    const iframeWindow: any = (document.getElementById('crispIframe') as HTMLIFrameElement)
      ?.contentWindow;
    const crisp = iframeWindow?.$crisp;

    if (!crisp) return;

    // Set crisp settings on the iframe window - these will be used by the following crisp script
    iframeWindow.CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
    iframeWindow.CRISP_RUNTIME_CONFIG = {
      lock_maximized: true,
      lock_full_view: true,
      cross_origin_cookies: true,
      locale: userSignUpLanguage,
    };

    if (userCrispTokenId) {
      iframeWindow.CRISP_TOKEN_ID = userCrispTokenId;
    }

    // Create the crisp script and insert it to the iframe
    const iframeDocument = iframeWindow.document;
    const iframeScript = iframeDocument.createElement('script');
    iframeScript.src = 'https://client.crisp.chat/l.js';
    iframeScript.async = 1;
    iframeDocument.getElementsByTagName('head')[0].appendChild(iframeScript);

    // Once the crisp script is loaded, setup event listeners
    iframeScript.onload = () => {
      let composeEventSent = false;

      logEvent(CHAT_VIEWED);

      if (ENVIRONMENT === ENVIRONMENTS.PRODUCTION) {
        crisp.push(['safe', true]); // Turns on safe mode = turns off errors in production
      }

      // Send custom event widget:loaded each time the widget is loaded
      // Acts as a trigger to overwrite the initial message - see AI automations -> chatbox triggers
      crisp.push(['set', 'session:event', 'widget:loaded']);
      // Set user email to set the contact
      crisp.push(['set', 'user:email', userEmail]);

      crisp.push([
        'on',
        'message:compose:sent',
        () => {
          if (!composeEventSent) {
            logEvent(CHAT_MESSAGE_COMPOSED);
            composeEventSent = true;
          }
        },
      ]);

      crisp.push([
        'on',
        'message:sent',
        () => {
          logEvent(CHAT_MESSAGE_SENT);
          composeEventSent = false;
        },
      ]);
    };
  };

  return (
    <Box sx={iframeContainerStyle}>
      <iframe
        id="crispIframe"
        height="550px"
        width="100%"
        style={iframeStyle}
        src={'/crisp.html'} // Basic window object for iframe, crisp setup exists in onLoad function
        onLoad={iframeLoaded}
      />
    </Box>
  );
};
