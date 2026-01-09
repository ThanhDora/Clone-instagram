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

