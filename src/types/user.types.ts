export type UserRole = 'ADMIN' | 'VENDOR' | 'GUARD';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  createdAt: string;
  updatedAt: string;
}
