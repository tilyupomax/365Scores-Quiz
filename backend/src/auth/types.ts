import type { UserIdentifier } from '@/users/types';
import type { Request } from 'express';

export type AuthenticatedUser = UserIdentifier;

export interface AuthenticatedRequest extends Request {
  sessionUser: AuthenticatedUser;
}

declare module 'express' {
  interface Request {
    sessionUser?: AuthenticatedUser;
  }
}
