export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatar?: string;
  bio?: string;
  followers: number;
  following: number;
  posts: number;
  isVerified?: boolean;
  mutualFriends?: string[]; // Array of user IDs who are mutual friends
}

