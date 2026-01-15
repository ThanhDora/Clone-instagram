export interface Notification {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  type: "like" | "comment" | "follow" | "mention";
  text: string;
  thumbnail?: string;
  timestamp: string;
  isRead: boolean;
}

export interface TNotification {
  _id: string;
  userId: {
    _id: string;
    username: string;
    fullName?: string;
    profilePicture?: string;
  };
  type: "like" | "comment" | "follow" | "mention" | "post";
  relatedPostId?: string;
  relatedPostImage?: string;
  content?: string;
  isRead: boolean;
  createdAt: string;
}

export interface TNotificationsResponse {
  success: boolean;
  message: string;
  data: {
    notifications: TNotification[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalNotifications: number;
      hasMore: boolean;
    };
  };
}

export interface TUnreadNotificationsCountResponse {
  success: boolean;
  message: string;
  data: {
    unreadCount: number;
  };
}
