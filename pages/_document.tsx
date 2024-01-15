import createEmotionServer from '@emotion/server/create-instance';
import newrelic from 'newrelic';
import { AppType } from 'next/app';
import Document, { Head, Html, Main, NextScript } from 'next/document';
import * as React from 'react';
import GoogleTagManagerScript from '../components/head/GoogleTagManagerScript';
import OpenGraphMetadata from '../components/head/OpenGraphMetadata';
import RollbarScript from '../components/head/RollbarScript';
import createEmotionCache from '../config/emotionCache';
import { MyAppProps } from './_app';

type NewRelicProps = {
  browserTimingHeader: string;
};

export default class MyDocument extends Document<NewRelicProps> {
  render() {
    return (
      <Html lang="en">
        <Head>
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{ __html: this.props.browserTimingHeader }}
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Open+Sans:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&display=swap"
            rel="stylesheet"
          />
          <OpenGraphMetadata />
          <GoogleTagManagerScript />
          <RollbarScript />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

// For SSG compatibility with MUI
// `getInitialProps` belongs to `_document` (instead of `_app`),
MyDocument.getInitialProps = async (ctx) => {
  // Resolution order
  //
  // On the server:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // On the server with error:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // On the client
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  // Set New Relic browser script
  // See https://newrelic.com/blog/how-to-relic/nextjs-monitor-application-data
  const initialProps = await Document.getInitialProps(ctx);

  // @ts-ignore
  if (newrelic?.agent && !newrelic?.agent?.collector.isConnected()) {
    await new Promise((resolve) => {
      // @ts-ignore
      newrelic?.agent?.on('connected', resolve);
    });
  }

  const browserTimingHeader = newrelic.getBrowserTimingHeader({
    hasToRemoveScriptWrapper: true,
    // @ts-ignore
    allowTransactionlessInjection: true,
  });

  const originalRenderPage = ctx.renderPage;

  // You can consider sharing the same Emotion cache between all the SSR requests to speed up performance.
  // However, be aware that it can have global side effects.
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App: React.ComponentType<React.ComponentProps<AppType> & MyAppProps>) =>
        function EnhanceApp(props) {
          return <App emotionCache={cache} {...props} />;
        },
    });

  // This is important. It prevents Emotion to render invalid HTML.
  // See https://github.com/mui/material-ui/issues/26561#issuecomment-855286153
  const emotionStyles = extractCriticalToChunks(initialProps.html);
  const emotionStyleTags = emotionStyles.styles.map((style: any) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(' ')}`}
      key={style.key}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ));

  return {
    ...initialProps,
    browserTimingHeader,
    styles: emotionStyleTags,
  };
};
