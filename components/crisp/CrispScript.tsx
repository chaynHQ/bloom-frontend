import { useRouter } from 'next/router';
import Script from 'next/script';
import { useEffect } from 'react';
import { CHAT_MESSAGE_SENT, CHAT_STARTED, FIRST_CHAT_STARTED } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import { createCrispProfileData } from './utils/createCrispProfileData';

const CrispScript = () => {
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const userEmail = useTypedSelector((state) => state.user.email);
  const userCrispTokenId = useTypedSelector((state) => state.user.crispTokenId);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const courses = useTypedSelector((state) => state.courses);

  const router = useRouter();

  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENV === 'production') {
      (window as any).$crisp.push(['safe', true]);
    }
    (window as any).$crisp.push([
      'on',
      'chat:initiated',
      () => {
        logEvent(FIRST_CHAT_STARTED, eventUserData);
      },
    ]);
    (window as any).$crisp.push([
      'on',
      'message:sent',
      () => {
        logEvent(CHAT_MESSAGE_SENT, eventUserData);
      },
    ]);
    (window as any).$crisp.push([
      'on',
      'chat:opened',
      () => {
        logEvent(CHAT_STARTED, eventUserData);
      },
    ]);
  });

  useEffect(() => {
    const hasLiveAccess =
      partnerAccesses.length === 0
        ? true
        : partnerAccesses.find((partnerAccess) => partnerAccess.featureLiveChat === true);
    if (userEmail && hasLiveAccess) {
      (window as any).CRISP_TOKEN_ID = userCrispTokenId;
      (window as any).$crisp.push(['do', 'session:reset']);
      (window as any).$crisp.push(['set', 'user:email', [userEmail]]);
      const segments =
        partnerAccesses.length > 0
          ? partnerAccesses.map((pa) => pa.partner.name.toLowerCase())
          : ['public'];
      (window as any).$crisp.push(['set', 'session:segments', [segments]]);
      (window as any).$crisp.push([
        'set',
        'session:data',
        [createCrispProfileData(partnerAccesses, courses)],
      ]);

      (window as any).$crisp.push(['do', 'chat:show']);
    } else {
      (window as any).$crisp.push(['do', 'chat:hide']);
    }
  });

  const crispScriptUrl = 'https://client.crisp.chat/l.js';

  return (
    <Script
      id="crisp-widget"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
            window.$crisp=[];
            CRISP_RUNTIME_CONFIG = {
              locale : ${router.locale ? `"${router.locale}"` : 'en'}
            };
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
