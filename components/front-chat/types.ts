export type MessageDirection = 'user' | 'agent';

export type MessageStatus = 'sending' | 'sent' | 'failed';

export type MessageKind = 'text' | 'image' | 'voice' | 'attachment';

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
  /** Backend proxy URL for historical image/audio messages loaded from Front */
  attachmentUrl?: string;
}

export interface AgentReplyPayload {
  id?: string;
  body: string;
  authorEmail?: string;
  authorName?: string;
  emittedAt: number;
}
