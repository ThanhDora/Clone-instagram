export interface Post {
  _id: string;
  userId?: string | {
    _id: string;
    username: string;
    fullName?: string;
    profilePicture?: string;
  };
  caption?: string;
  image?: string;
  video?: string;
  mediaType: "image" | "video";
  likes: number;
  comments: number;
  createdAt: string;
  isLiked?: boolean;
  isSaved?: boolean;
  user?: {
    _id: string;
    username: string;
    fullName?: string;
    profilePicture?: string;
  };
}

export type TGetUserPostsResponse = {
  success: boolean;
  message: string;
  data: {
    posts: Post[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalPosts: number;
      hasMore: boolean;
    };
  };
};

export type TGetFeedResponse = {
  success: boolean;
  message: string;
  data: {
    posts: Post[];
    pagination?: {
      currentPage?: number;
      totalPages?: number;
      totalPosts?: number;
      hasMore?: boolean;
    };
  };
};
