import newrelic from 'newrelic';
import Script from 'next/script';

import '../styles/globals.css';

export default async function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  // Configuration according to Newrelic app router example
  // See https://github.com/newrelic/newrelic-node-nextjs?tab=readme-ov-file#example-projects
  // @ts-ignore
  if (newrelic.agent.collector.isConnected() === false) {
    await new Promise((resolve) => {
      // @ts-ignore
      newrelic.agent.on('connected', resolve);
    });
  }

  const browserTimingHeader = newrelic.getBrowserTimingHeader({
    hasToRemoveScriptWrapper: true,
    // @ts-ignore
    allowTransactionlessInjection: true,
  });

  return (
    <html lang="en">
      <body>
        {children}
        <Script
          // We have to set an id for inline scripts.
          // See https://nextjs.org/docs/app/building-your-application/optimizing/scripts#inline-scripts
          id="nr-browser-agent"
          // By setting the strategy to "beforeInteractive" we guarantee that
          // the script will be added to the document's `head` element.
          strategy="beforeInteractive"
          // The body of the script element comes from the async evaluation
          // of `getInitialProps`. We use the special
          // `dangerouslySetInnerHTML` to provide that element body. Since
          // it requires an object with an `__html` property, we pass in an
          // object literal.
          dangerouslySetInnerHTML={{ __html: browserTimingHeader }}
        />
      </body>
    </html>
  );
}
