import { LeaderboardController } from '@/leaderboard/leaderboard.controller';
import { LeaderboardGateway } from '@/leaderboard/leaderboard.gateway';
import { LeaderboardSseController } from '@/leaderboard/leaderboard.sse.controller';
import {
  LeaderboardService,
  LeaderboardSseService,
} from '@/leaderboard/services';
import { Module } from '@nestjs/common';

@Module({
  providers: [LeaderboardService, LeaderboardGateway, LeaderboardSseService],
  controllers: [LeaderboardController, LeaderboardSseController],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
