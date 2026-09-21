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

export type SignUpInput = {
  name: string;
  surname: string;
  email: string;
  password: string;
};

export type UpdateProfileInput = {
  name: string;
  surname: string;
  email: string;
};

export type DeleteAccountInput = {
  password: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};
