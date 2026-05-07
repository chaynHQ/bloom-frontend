export type MessageDirection = 'user' | 'agent';

export type MessageStatus = 'sending' | 'sent' | 'failed';

export type MessageKind = 'text' | 'image' | 'voice' | 'file';

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export interface ChatMessage {
  id: string;
  direction: MessageDirection;
  kind: MessageKind;
  text?: string;
  authorName?: string;
  createdAt: number;
  status: MessageStatus;
  /** Object URL for local image preview — only populated on outgoing image messages before page reload */
  previewUrl?: string;
  /** Backend proxy URL for historical image/audio/file messages loaded from Front */
  attachmentUrl?: string;
  /** Original filename — used to label the download link for `file` kind */
  attachmentName?: string;
}

export interface AgentReplyPayload {
  id: string;
  body: string;
  authorEmail?: string;
  authorName?: string;
  /** Unix timestamp in seconds (multiply by 1000 to get ms) */
  emittedAt: number;
  /** Relative proxy path — prefix with API_URL before use */
  attachmentUrl?: string;
  /** Original filename — used to label the download link for `file` kind */
  attachmentName?: string;
  kind?: 'image' | 'voice' | 'file';
}

/** Raw message shape returned by the /front-chat/messages history endpoint */
export interface HistoryEntry {
  id: string;
  direction: 'user' | 'agent';
  kind?: 'image' | 'voice' | 'file';
  text: string;
  attachmentUrl?: string;
  attachmentName?: string;
  authorName?: string;
  createdAt: number;
}
