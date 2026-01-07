export type TLoginRequest = {
  email: string;
  password: string;
};

export type TLoginResponse = {
  access_token: string;
  refresh_token: string;
  user?: TUser;
};

export type TUser = {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  avatar?: string;
  bio?: string;
};

export type TAuthError = {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
};
