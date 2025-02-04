import Rollbar from 'rollbar';

const baseConfig = {
  captureUncaught: true,
  captureUnhandledRejections: true,
  environment: process.env.NODE_ENV,
  captureIP: 'anonymize',
  payload: {
    environment: process.env.NODE_ENV,
    client: {
      javascript: {
        source_map_enabled: true,
        code_version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
        guess_uncaught_frames: true,
      },
    },
  },
};

export const clientConfig = {
  accessToken: process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN,
  ...baseConfig,
};

export const serverInstance = new Rollbar({
  accessToken: process.env.ROLLBAR_SERVER_TOKEN,
  ...baseConfig,
});
