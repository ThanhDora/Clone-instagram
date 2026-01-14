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
