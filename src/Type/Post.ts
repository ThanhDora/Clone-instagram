export interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: string;
  isLiked?: boolean;
}

