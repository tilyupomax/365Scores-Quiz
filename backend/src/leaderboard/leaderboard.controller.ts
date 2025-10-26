import { DEFAULT_MAX_ENTRIES } from '@/leaderboard/constants';
import { LeaderboardResponseDto } from '@/leaderboard/dtos';
import { LeaderboardService } from '@/leaderboard/services';
import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('top')
  async getTopEntries(
    @Query('limit', new DefaultValuePipe(DEFAULT_MAX_ENTRIES), ParseIntPipe)
    limit: number,
  ): Promise<LeaderboardResponseDto> {
    const safeLimit = Math.min(Math.max(limit, 1), DEFAULT_MAX_ENTRIES);
    return this.leaderboardService
      .getTopPlayers(safeLimit)
      .then(LeaderboardResponseDto.from);
  }
}
