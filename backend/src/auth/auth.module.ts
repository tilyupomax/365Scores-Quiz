import { SessionGuard } from '@/auth/services';
import { UsersModule } from '@/users/users.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [UsersModule],
  providers: [SessionGuard],
  exports: [SessionGuard],
})
export class AuthModule {}
