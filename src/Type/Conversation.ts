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

export interface TConversationParticipant {
  _id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
}

export interface TConversationLastMessage {
  _id: string;
  messageType: "text" | "image";
  content?: string;
  imageUrl?: string;
  createdAt: string;
  senderId: string;
  isRead: boolean;
}

export interface TConversation {
  _id: string;
  participants: TConversationParticipant[];
  lastMessage?: TConversationLastMessage;
  lastMessageAt: string;
  unreadCount: number;
  createdAt: string;
}

export interface TConversationsResponse {
  success: boolean;
  message: string;
  data: {
    conversations: TConversation[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalConversations: number;
      hasMore: boolean;
    };
  };
}

export interface TCreateConversationRequest {
  userId: string;
}

export interface TCreateConversationResponse {
  success: boolean;
  message: string;
  data: TConversation;
}
