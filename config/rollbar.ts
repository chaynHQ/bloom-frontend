import getConfig from 'next/config';
import Rollbar from 'rollbar';

const { publicRuntimeConfig } = getConfig();
const token = publicRuntimeConfig.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN;
const rollbarEnvironment = publicRuntimeConfig.NEXT_PUBLIC_ENV;

const rollbar = new Rollbar({
  accessToken: token,
  captureUncaught: true,
  captureUnhandledRejections: true,
  enabled: token !== 'false',
  environment: rollbarEnvironment,
});

export default rollbar;
