import type { CachedLeaderboard } from '@/leaderboard/types';
import { Exclude, Expose, Type, plainToInstance } from 'class-transformer';

import { LeaderboardEntryResponseDto } from '@/leaderboard/dtos/response/leaderboard-entry.response.dto';

@Exclude()
export class LeaderboardResponseDto implements CachedLeaderboard {
  @Expose()
  readonly updatedAt!: string;

  @Expose()
  @Type(() => LeaderboardEntryResponseDto)
  readonly entries!: LeaderboardEntryResponseDto[];

  static from(leaderboard: CachedLeaderboard): LeaderboardResponseDto {
    return plainToInstance(LeaderboardResponseDto, leaderboard, {
      excludeExtraneousValues: true,
    });
  }
}
