export type TLoginRequest = {
  email: string;
  password: string;
};

export type TLoginResponse = {
  success: boolean;
  message: string;
  data: {
    user: TUser;
    accessToken: string;
    refreshToken: string;
  };
};

export type TRegisterRequest = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
};

export type TRegisterResponse = {
  success: boolean;
  message: string;
  data: {
    user: TUser;
  };
};

export type TVerifyEmailResponse = {
  success: boolean;
  message: string;
  data: {
    user: TUser;
  };
};

export type TGetProfileResponse = {
  success: boolean;
  message: string;
  data: TUser & {
    followersCount?: number;
    followingCount?: number;
    postsCount?: number;
  };
};

export type TGetUserByIdResponse = {
  success: boolean;
  message: string;
  data: {
    _id: string;
    username: string;
    fullName?: string;
    profilePicture?: string;
    bio?: string;
    website?: string;
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
    postsCount: number;
    createdAt?: string;
  };
};

export type TUpdateProfileResponse = {
  success: boolean;
  message: string;
  data: {
    _id: string;
    username: string;
    fullName?: string;
    profilePicture?: string;
    bio?: string;
    website?: string;
  };
};

export type TUser = {
  _id: string;
  email: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
  bio?: string;
  website?: string;
  gender?: "male" | "female" | "other";
  isVerified?: boolean;
  createdAt?: string;
  // Legacy fields for backward compatibility
  id?: string;
  avatar?: string;
};

export type TAuthError = {
  success?: boolean;
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
};

export type TAvatar = {
  image: string;
};

export type TSuggestedUser = {
  _id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
  bio?: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  recentImages?: string[];
};

export type TSuggestedUsersResponse = {
  success: boolean;
  message: string;
  data: TSuggestedUser[];
};

export type TSearchUser = {
  _id: string;
  username: string;
  email?: string;
  fullName?: string;
  profilePicture?: string;
  bio?: string;
  website?: string;
};

export type TSearchUsersResponse = {
  success: boolean;
  message: string;
  data: TSearchUser[];
};

export type TSearchHistoryItem = {
  _id: string;
  searchQuery: string;
  searchedUser?: {
    _id: string;
    username: string;
    fullName?: string;
    profilePicture?: string;
  };
  searchedUserId?: string;
  createdAt: string;
};

export type TSearchHistoryResponse = {
  success: boolean;
  message: string;
  data: TSearchHistoryItem[];
};

export type TAddSearchHistoryRequest = {
  searchedUserId: string;
  searchQuery: string;
};

export type TAddSearchHistoryResponse = {
  success: boolean;
  message: string;
  data: {
    _id: string;
    userId: string;
    searchedUserId: string;
    searchQuery: string;
    createdAt: string;
  };
};
