// Temporary mock database for Instagram clone

import type { User } from "@/Type/User";
import type { Post } from "@/Type/Post";
import type { Comment } from "@/Type/Comment";
import type { Story } from "@/Type/Story";
import type { Message } from "@/Type/Message";
import type { Conversation } from "@/Type/Conversation";

// Re-export types for convenience
export type { User, Post, Comment, Story, Message, Conversation };

// Mock Users
export const mockUsers: User[] = [
  {
    id: "1",
    username: "johndoe",
    fullName: "John Doe",
    email: "john@example.com",
    avatar: "https://i.pravatar.cc/150?img=1",
    bio: "Photographer | Traveler | Coffee Lover",
    followers: 1250,
    following: 450,
    posts: 89,
    isVerified: true,
  },
  {
    id: "2",
    username: "janedoe",
    fullName: "Jane Doe",
    email: "jane@example.com",
    avatar: "https://i.pravatar.cc/150?img=5",
    bio: "Fashion Designer",
    followers: 3200,
    following: 890,
    posts: 156,
    isVerified: true,
    mutualFriends: ["3", "4"],
  },
  {
    id: "3",
    username: "techguru",
    fullName: "Tech Guru",
    email: "tech@example.com",
    avatar: "https://i.pravatar.cc/150?img=12",
    bio: "Tech Enthusiast | Developer",
    followers: 8900,
    following: 120,
    posts: 234,
    mutualFriends: ["2", "5"],
  },
  {
    id: "4",
    username: "foodie",
    fullName: "Foodie Adventures",
    email: "foodie@example.com",
    avatar: "https://i.pravatar.cc/150?img=8",
    bio: "Exploring the world one dish at a time",
    followers: 5600,
    following: 780,
    posts: 412,
    mutualFriends: ["2", "5"],
  },
  {
    id: "5",
    username: "traveler",
    fullName: "Wanderlust",
    email: "travel@example.com",
    avatar: "https://i.pravatar.cc/150?img=15",
    bio: "Travel blogger | Adventure seeker",
    followers: 15200,
    following: 450,
    posts: 678,
    isVerified: true,
    mutualFriends: ["3", "4"],
  },
];

// Mock Posts
export const mockPosts: Post[] = [
  {
    id: "1",
    userId: "1",
    username: "johndoe",
    userAvatar: "https://i.pravatar.cc/150?img=1",
    image: "https://picsum.photos/800/800?random=1",
    caption: "Beautiful sunset today! 🌅 #sunset #photography",
    likes: 245,
    comments: 12,
    timestamp: "2 hours ago",
    isLiked: false,
  },
  {
    id: "2",
    userId: "2",
    username: "janedoe",
    userAvatar: "https://i.pravatar.cc/150?img=5",
    image: "https://picsum.photos/800/800?random=2",
    caption: "New collection coming soon! ✨",
    likes: 1890,
    comments: 89,
    timestamp: "5 hours ago",
    isLiked: true,
  },
  {
    id: "3",
    userId: "3",
    username: "techguru",
    userAvatar: "https://i.pravatar.cc/150?img=12",
    image: "https://picsum.photos/800/800?random=3",
    caption: "Just shipped a new feature! 🚀 #coding #webdev",
    likes: 342,
    comments: 23,
    timestamp: "1 day ago",
    isLiked: false,
  },
  {
    id: "4",
    userId: "4",
    username: "foodie",
    userAvatar: "https://i.pravatar.cc/150?img=8",
    image: "https://picsum.photos/800/800?random=4",
    caption: "Best pasta I've ever had! 🍝 #foodie #italian",
    likes: 567,
    comments: 34,
    timestamp: "1 day ago",
    isLiked: true,
  },
  {
    id: "5",
    userId: "5",
    username: "traveler",
    userAvatar: "https://i.pravatar.cc/150?img=15",
    image: "https://picsum.photos/800/800?random=5",
    caption: "Exploring the mountains 🏔️ #travel #adventure",
    likes: 1234,
    comments: 67,
    timestamp: "2 days ago",
    isLiked: false,
  },
];

// Mock Comments
export const mockComments: Comment[] = [
  {
    id: "1",
    postId: "1",
    userId: "2",
    username: "janedoe",
    userAvatar: "https://i.pravatar.cc/150?img=5",
    text: "Amazing shot! 🔥",
    likes: 12,
    timestamp: "1 hour ago",
  },
  {
    id: "2",
    postId: "1",
    userId: "3",
    username: "techguru",
    userAvatar: "https://i.pravatar.cc/150?img=12",
    text: "Love this!",
    likes: 5,
    timestamp: "2 hours ago",
  },
  {
    id: "3",
    postId: "2",
    userId: "1",
    username: "johndoe",
    userAvatar: "https://i.pravatar.cc/150?img=1",
    text: "Can't wait to see it!",
    likes: 8,
    timestamp: "4 hours ago",
  },
];

// Mock Stories
export const mockStories: Story[] = [
  {
    id: "1",
    userId: "1",
    username: "johndoe",
    userAvatar: "https://i.pravatar.cc/150?img=1",
    image: "https://picsum.photos/400/700?random=10",
    timestamp: "2 hours ago",
    isViewed: false,
  },
  {
    id: "2",
    userId: "2",
    username: "janedoe",
    userAvatar: "https://i.pravatar.cc/150?img=5",
    image: "https://picsum.photos/400/700?random=11",
    timestamp: "5 hours ago",
    isViewed: false,
  },
  {
    id: "3",
    userId: "3",
    username: "techguru",
    userAvatar: "https://i.pravatar.cc/150?img=12",
    image: "https://picsum.photos/400/700?random=12",
    timestamp: "1 day ago",
    isViewed: true,
  },
  {
    id: "4",
    userId: "4",
    username: "foodie",
    userAvatar: "https://i.pravatar.cc/150?img=8",
    image: "https://picsum.photos/400/700?random=13",
    timestamp: "1 day ago",
    isViewed: true,
  },
];

// Mock Messages
export const mockMessages: Message[] = [
  {
    id: "1",
    conversationId: "conv1",
    senderId: "2",
    receiverId: "1",
    text: "Hey! How are you?",
    timestamp: "10:30 AM",
    isRead: true,
  },
  {
    id: "2",
    conversationId: "conv1",
    senderId: "1",
    receiverId: "2",
    text: "I'm doing great, thanks!",
    timestamp: "10:32 AM",
    isRead: true,
  },
  {
    id: "3",
    conversationId: "conv2",
    senderId: "3",
    receiverId: "1",
    text: "Check out this new project!",
    timestamp: "Yesterday",
    isRead: false,
  },
];

// Mock Conversations
export const mockConversations: Conversation[] = [
  {
    id: "conv1",
    participants: ["1", "2"],
    lastMessage: mockMessages[1],
    unreadCount: 0,
  },
  {
    id: "conv2",
    participants: ["1", "3"],
    lastMessage: mockMessages[2],
    unreadCount: 1,
  },
  {
    id: "conv3",
    participants: ["1", "4"],
    lastMessage: undefined,
    unreadCount: 0,
  },
];

// Helper functions
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find((user) => user.id === id);
};

export const getUserByUsername = (username: string): User | undefined => {
  return mockUsers.find((user) => user.username === username);
};

export const getPostsByUserId = (userId: string): Post[] => {
  return mockPosts.filter((post) => post.userId === userId);
};

export const getCommentsByPostId = (postId: string): Comment[] => {
  return mockComments.filter((comment) => comment.postId === postId);
};

export const getStoriesByUserId = (userId: string): Story[] => {
  return mockStories.filter((story) => story.userId === userId);
};

export const getConversationById = (id: string): Conversation | undefined => {
  return mockConversations.find((conv) => conv.id === id);
};

export const getMessagesByConversationId = (
  conversationId: string
): Message[] => {
  return mockMessages.filter(
    (message) => message.conversationId === conversationId
  );
};
