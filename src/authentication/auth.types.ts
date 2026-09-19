export type AuthUser = {
  id: string;
  name: string;
  surname: string;
  email: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type SignInInput = {
  email: string;
  password: string;
};
