export interface Post {
  _id: string;
  userId?: string;
  caption?: string;
  image?: string;
  video?: string;
  mediaType: "image" | "video";
  likes: number;
  comments: number;
  createdAt: string;
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
