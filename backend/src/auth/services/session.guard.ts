import {
  STICKY_USER_SESSION_COOKIE,
  STICKY_USER_SESSION_MAX_AGE_MS,
} from '@/auth/constants';
import type { AuthenticatedUser } from '@/auth/types';
import { UsersService } from '@/users/services';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const cookies = request.cookies as
      | Record<string, string | undefined>
      | undefined;
    const sessionId = cookies?.[STICKY_USER_SESSION_COOKIE];
    let user: AuthenticatedUser | null = null;

    if (sessionId) {
      try {
        user = await this.usersService.findById(sessionId);
      } catch (error) {
        if (!(error instanceof NotFoundException)) {
          throw error;
        }
      }
    }

    user ??= await this.usersService.create();

    const cookieValue = sessionId ?? user.id;

    response.cookie(STICKY_USER_SESSION_COOKIE, cookieValue, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: STICKY_USER_SESSION_MAX_AGE_MS,
      path: '/',
    });

    request.sessionUser = user;

    return true;
  }
}
