export type ChatRole = 'user' | 'assistant' | 'notice';

export type NoticeTone = 'info' | 'warning' | 'danger';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: Date;
  tokens?: number;
  tone?: NoticeTone;
}

export class ChatMessageFactory {
  private static sequence = 0;

  static user(content: string): ChatMessage {
    return ChatMessageFactory.create('user', content);
  }

  static assistant(content: string, tokens: number): ChatMessage {
    return { ...ChatMessageFactory.create('assistant', content), tokens };
  }

  static notice(content: string, tone: NoticeTone): ChatMessage {
    return { ...ChatMessageFactory.create('notice', content), tone };
  }

  private static create(role: ChatRole, content: string): ChatMessage {
    ChatMessageFactory.sequence += 1;
    return { id: `${role}-${Date.now()}-${ChatMessageFactory.sequence}`, role, content, createdAt: new Date() };
  }
}
