import { AuthModule } from '@/auth/auth.module';
import { LeaderboardModule } from '@/leaderboard/leaderboard.module';
import { QuizController } from '@/quiz/quiz.controller';
import { QuizService } from '@/quiz/services';
import { UsersModule } from '@/users/users.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [LeaderboardModule, AuthModule, UsersModule],
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule {}
