import { useEffect } from 'react';

interface CrispProps {
  email: string | null;
}

const Crisp = (props: CrispProps) => {
  const { email } = props;

  useEffect(() => {
    (window as any).$crisp = [];
    (window as any).CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
    (() => {
      const d = document;
      const s = d.createElement('script');
      s.src = 'https://client.crisp.chat/l.js';
      s.async = true;
      d.getElementsByTagName('body')[0].appendChild(s);

      email && (window as any).$crisp.push(['set', 'user:email', [email]]);
    })();
  }, [email]);

  return null;
};

export default Crisp;
