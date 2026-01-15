export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface TMessageSender {
  _id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
}

export interface TMessage {
  _id: string;
  conversationId: string;
  senderId: TMessageSender | string;
  recipientId: string;
  messageType: "text" | "image";
  content?: string;
  imageUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface TMessagesResponse {
  success: boolean;
  message: string;
  data: {
    messages: TMessage[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalMessages: number;
      hasMore: boolean;
    };
  };
}

export interface TSendTextMessageRequest {
  conversationId: string;
  recipientId: string;
  messageType: "text";
  content: string;
}

export interface TSendImageMessageRequest {
  conversationId: string;
  recipientId: string;
  messageType: "image";
  image: File;
}

export interface TSendMessageResponse {
  success: boolean;
  message: string;
  data: TMessage;
}

export interface TMarkMessageReadResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    isRead: true;
  };
}

export interface TUnreadCountResponse {
  success: boolean;
  message: string;
  data: {
    unreadCount: number;
  };
}
