import type { LeaderboardEntry } from '@/leaderboard/types';
import { Exclude, Expose, plainToInstance } from 'class-transformer';

@Exclude()
export class LeaderboardEntryResponseDto implements LeaderboardEntry {
  @Expose()
  readonly rank!: number;

  @Expose()
  readonly userId!: string;

  @Expose()
  readonly score!: number;

  @Expose()
  readonly achievedAt!: string;

  static from(entry: LeaderboardEntry): LeaderboardEntryResponseDto {
    return plainToInstance(LeaderboardEntryResponseDto, entry, {
      excludeExtraneousValues: true,
    });
  }
}
