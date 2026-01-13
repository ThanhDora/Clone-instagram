import type { Message } from "./Message";

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface ConversationWithUser extends Conversation {
  otherUser?: {
    id: string;
    username: string;
    fullName: string;
    avatar?: string;
    isActive?: boolean;
    lastActive?: string;
  };
}
