import Script from 'next/script';
import { useEffect, useState } from 'react';
import { RootState } from '../../app/store';
import { CHAT_MESSAGE_SENT, CHAT_STARTED, FIRST_CHAT_STARTED } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import logEvent, { getEventUserData } from '../../utils/logEvent';

const CrispScript = () => {
  const { user, partnerAccesses, partnerAdmin } = useTypedSelector((state: RootState) => state);

  const eventData = getEventUserData({ user, partnerAccesses, partnerAdmin });
  const [showLiveChat, setShowLiveChat] = useState<boolean>(false);

  useEffect(() => {
    const liveAccess = partnerAccesses.find(
      (partnerAccess) => partnerAccess.featureLiveChat === true,
    );
    if (user.email && liveAccess) {
      setShowLiveChat(true);
    } else {
      setShowLiveChat(false);
    }
  }, [user, partnerAccesses]);

  useEffect(() => {
    if ((window as any).$crisp && (window as any).$crisp.push) {
      if (process.env.NEXT_PUBLIC_ENV === 'production') {
        (window as any).$crisp.push(['safe', true]);
      }
      (window as any).$crisp.push(['do', 'chat:hide']);
      (window as any).$crisp.push([
        'on',
        'chat:initiated',
        () => {
          logEvent(FIRST_CHAT_STARTED, eventData);
        },
      ]);
      (window as any).$crisp.push([
        'on',
        'message:sent',
        () => {
          logEvent(CHAT_MESSAGE_SENT, eventData);
        },
      ]);
      (window as any).$crisp.push([
        'on',
        'chat:opened',
        () => {
          logEvent(CHAT_STARTED, eventData);
        },
      ]);
    }
  }, []);

  useEffect(() => {
    if ((window as any).$crisp && (window as any).$crisp.is) {
      if (showLiveChat) {
        (window as any).$crisp.push(['set', 'user:email', [user.email]]);
        (window as any).$crisp.push(['do', 'chat:show']);
      } else {
        (window as any).$crisp.push(['do', 'chat:hide']);
        (window as any).$crisp.push(['do', 'session:reset']);
      }
    }
  }, [showLiveChat, user]);

  const crispScriptUrl = 'https://client.crisp.chat/l.js';

  return (
    <Script
      id="crisp-widget"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
            window.$crisp=[];
            window.CRISP_WEBSITE_ID="${process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID}";
            (function(){
              const d = document;
              const s = d.createElement("script");
              s.src = "${crispScriptUrl}";
              s.async = 1;
              d.getElementsByTagName("head")[0].appendChild(s);
            })();`,
      }}
    />
  );
};

export default CrispScript;
