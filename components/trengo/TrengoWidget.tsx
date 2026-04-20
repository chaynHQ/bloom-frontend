'use client';

import { CHAT_MESSAGE_COMPOSED, CHAT_MESSAGE_SENT, CHAT_VIEWED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { createTrengoProfileData } from '@/lib/utils/createTrengoProfileData';
import logEvent from '@/lib/utils/logEvent';
import { Box } from '@mui/material';
import { useEffect, useRef } from 'react';

const iframeContainerStyle = {
  width: '100%',
  height: '450px',
  maxHeight: '70vh',
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  overflow: 'hidden',
} as const;

const iframeStyle = {
  marginTop: -230,
  borderRadius: 16,
  maxHeight: 'calc(70vh + 158px)',
} as const;

export const TrengoWidget = () => {
  const userEmail = useTypedSelector((state) => state.user.email);
  const userName = useTypedSelector((state) => state.user.name);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const courses = useTypedSelector((state) => state.courses);
  const fieldIdsRef = useRef<Record<string, number> | null>(null);

  // Fetch custom field ID mapping from the backend on mount
  useEffect(() => {
    const fetchFieldIds = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trengo/custom-field-ids`);
        if (res.ok) {
          fieldIdsRef.current = await res.json();
        }
      } catch {
        // Non-critical: widget still works without custom fields
      }
    };
    fetchFieldIds();
  }, []);

  const iframeLoaded = async () => {
    const iframeEl = document.getElementById('trengoIframe') as HTMLIFrameElement;
    const iframeWindow: any = iframeEl?.contentWindow;
    const trengo = iframeWindow?.Trengo;

    if (!trengo) return;

    // Set Trengo configuration on the iframe window before loading the script
    trengo.key = process.env.NEXT_PUBLIC_TRENGO_WIDGET_KEY;
    trengo.render = true;

    // Identify user by email and pass profile data as custom fields.
    // Email acts as the persistent contact identifier in Trengo (replaces Crisp's CRISP_TOKEN_ID).
    if (userEmail) {
      const contactData: any = {
        email: userEmail,
        ...(userName && { name: userName }),
      };

      // Map profile data to Trengo custom_fields format using numeric field IDs
      if (fieldIdsRef.current && partnerAccesses && courses) {
        const profileData = createTrengoProfileData(partnerAccesses, courses);
        const customFields = profileData
          .map(([key, value]) => {
            const fieldId = fieldIdsRef.current?.[String(key)];
            if (fieldId) {
              return { field_id: fieldId, value: String(value) };
            }
            return null;
          })
          .filter(Boolean);

        if (customFields.length > 0) {
          contactData.custom_fields = customFields;
        }
      }

      trengo.contact_data = contactData;
    }

    let composeEventSent = false;

    // Set up event callbacks before script loads
    trengo.on_ready = () => {
      logEvent(CHAT_VIEWED);

      // Open the chat channel by default so the widget displays the conversation view
      if (iframeWindow.Trengo?.Api?.Widget) {
        iframeWindow.Trengo.Api.Widget.open('chat');
      }
    };

    trengo.on_open = () => {
      if (!composeEventSent) {
        logEvent(CHAT_MESSAGE_COMPOSED);
        composeEventSent = true;
      }
    };

    trengo.on_chat_started = () => {
      logEvent(CHAT_MESSAGE_SENT);
      composeEventSent = false;
    };

    // Create the Trengo embed script and insert it into the iframe
    const iframeDocument = iframeWindow.document;
    const iframeScript = iframeDocument.createElement('script');
    iframeScript.src = 'https://static.widget.trengo.eu/embed.js';
    iframeScript.async = true;
    iframeDocument.getElementsByTagName('head')[0].appendChild(iframeScript);
  };

  return (
    <Box sx={iframeContainerStyle}>
      <iframe
        id="trengoIframe"
        height="550px"
        width="100%"
        style={iframeStyle}
        src={'/trengo.html'}
        onLoad={iframeLoaded}
      />
    </Box>
  );
};
