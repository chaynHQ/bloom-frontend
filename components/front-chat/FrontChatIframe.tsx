'use client';

import { CHAT_VIEWED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent from '@/lib/utils/logEvent';
import { Box } from '@mui/material';
import { useCallback, useEffect, useRef } from 'react';

const FRONT_CHAT_SCRIPT_SRC = 'https://chat-assets.frontapp.com/v1/chat.bundle.js';

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
  border: 'none',
  colorScheme: 'normal',
} as const;

export const FrontChatIframe = () => {
  const userEmail = useTypedSelector((state) => state.user.email);
  const userName = useTypedSelector((state) => state.user.name);
  const frontChatUserHash = useTypedSelector((state) => state.user.frontChatUserHash);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const initializedRef = useRef(false);

  const initFrontChat = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || initializedRef.current) return;

    const iframeWindow = iframe.contentWindow as any;
    const iframeDocument = iframe.contentDocument;
    if (!iframeWindow || !iframeDocument) return;

    initializedRef.current = true;

    const scriptTag = iframeDocument.createElement('script');
    scriptTag.setAttribute('type', 'text/javascript');
    scriptTag.setAttribute('src', FRONT_CHAT_SCRIPT_SRC);

    scriptTag.onload = () => {
      const initOptions: Record<string, any> = {
        chatId: process.env.NEXT_PUBLIC_FRONT_CHAT_ID,
        useDefaultLauncher: false,
        shouldShowWindowOnLaunch: true,
        shouldHideCloseButton: true,
        shouldHideExpandButton: true,
        shouldExpandOnShowWindow: true,
        onInitCompleted: () => {
          logEvent(CHAT_VIEWED);
        },
      };

      if (userEmail) {
        initOptions.email = userEmail;
      }
      if (userName) {
        initOptions.name = userName;
      }
      if (frontChatUserHash) {
        initOptions.userHash = frontChatUserHash;
      }

      iframeWindow.FrontChat?.('init', initOptions);
    };

    iframeDocument.body.appendChild(scriptTag);
  }, [userEmail, userName, frontChatUserHash]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    if (iframe.contentDocument?.readyState === 'complete') {
      initFrontChat();
    } else {
      iframe.addEventListener('load', initFrontChat);
      return () => iframe.removeEventListener('load', initFrontChat);
    }
  }, [initFrontChat]);

  // Shutdown Front Chat on unmount
  useEffect(() => {
    const iframe = iframeRef.current;
    return () => {
      const iframeWindow = iframe?.contentWindow as any;
      iframeWindow?.FrontChat?.('shutdown');
    };
  }, []);

  return (
    <Box sx={iframeContainerStyle}>
      <iframe
        ref={iframeRef}
        height="100%"
        width="100%"
        style={iframeStyle}
        title="Bloom messaging"
      />
    </Box>
  );
};
