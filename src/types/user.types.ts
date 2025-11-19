export type UserRole =
  | "ACCOUNT_OWNER"
  | "PORTFOLIO_MANAGER"
  | "PROPERTY_MANAGER"
  | "BUILDING_OWNER"
  | "TENANT"
  | "VENDOR"
  | "GUARD";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string | null;
  lastName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserListItem {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string | null;
  lastName?: string | null;
  createdAt: string;
  lastLoginAt?: string | null;
  invited?: boolean;
}

export interface UserInvitationItem {
  id: string;
  email: string;
  role: UserRole;
  expiresAt: string;
  invitedAt?: string;
  invitedByName?: string | null;
}
