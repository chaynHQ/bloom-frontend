import { EVENT_LOG_NAME } from './enums';

export interface EventLog {
  createdAt: string;
  updatedAt: string;
  id: string;
  date: string;
  event: {
    event: EVENT_LOG_NAME;
  };
  userId: string;
}
