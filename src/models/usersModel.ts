export type user = {
  id: string;
  googleId: string | null;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export type newUser = {
  googleId: string;
  email: string;
  displayName: string;
  avatarUrl: string;
}

export type exportUser = {
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}