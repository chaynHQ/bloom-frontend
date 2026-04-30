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
}

export interface AgentReplyPayload {
  id?: string;
  body: string;
  authorEmail?: string;
  authorName?: string;
  emittedAt: number;
}
