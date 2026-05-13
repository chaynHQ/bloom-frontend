export type MessageDirection = 'user' | 'agent';

export type MessageStatus = 'sending' | 'sent' | 'failed';

export type AttachmentKind = 'image' | 'voice' | 'file';

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export interface MessageAttachment {
  kind: AttachmentKind;
  /** Backend proxy URL — present for historical/agent attachments loaded from Front */
  url?: string;
  /** Original filename — used to label download links and image captions */
  name?: string;
  /** Object URL for a local preview — only populated on outgoing optimistic messages before page reload */
  previewUrl?: string;
}

export interface ChatMessage {
  id: string;
  direction: MessageDirection;
  text?: string;
  authorName?: string;
  createdAt: number;
  status: MessageStatus;
  /** Files Front delivered with the message, in original order — agents can attach several at once */
  attachments?: MessageAttachment[];
}

/** Shape received over the `agent_reply` socket event and inside a `history` entry — relative URLs that the client prefixes with API_URL. */
export interface AttachmentPayload {
  url: string;
  name?: string;
  kind: AttachmentKind;
}

export interface AgentReplyPayload {
  id: string;
  body: string;
  authorEmail?: string;
  authorName?: string;
  /** Unix timestamp in seconds (multiply by 1000 to get ms) */
  emittedAt: number;
  attachments?: AttachmentPayload[];
}

/** Raw message shape returned by the /front-chat/messages history endpoint */
export interface HistoryEntry {
  id: string;
  direction: 'user' | 'agent';
  text: string;
  attachments?: AttachmentPayload[];
  authorName?: string;
  createdAt: number;
}
