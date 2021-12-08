import { analytics } from '../config/firebase';

const logEvent = (event: string, params?: []) => {
  analytics?.logEvent(event, params!);
};

export default logEvent;
