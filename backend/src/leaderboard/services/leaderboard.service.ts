import { PrismaService } from '@/common/prisma/services';
import { RedisService } from '@/common/redis/services';
import {
  CACHE_TTL_SECONDS,
  DEFAULT_MAX_ENTRIES,
  LEADERBOARD_KEY,
} from '@/leaderboard/constants';
import { LeaderboardResponseDto } from '@/leaderboard/dtos';
import { LeaderboardGateway } from '@/leaderboard/leaderboard.gateway';
import { LeaderboardSseService } from '@/leaderboard/services/leaderboard-sse.service';
import type { CachedLeaderboard, LeaderboardEntry } from '@/leaderboard/types';
import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  forwardRef,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { Redis } from 'ioredis';

@Injectable()
export class LeaderboardService implements OnModuleInit {
  private readonly logger = new Logger(LeaderboardService.name);
  private readonly redis: Redis;

  constructor(
    private readonly prisma: PrismaService,
    redisService: RedisService,
    @Inject(forwardRef(() => LeaderboardGateway))
    private readonly leaderboardGateway: LeaderboardGateway,
    private readonly leaderboardSseService: LeaderboardSseService,
  ) {
    this.redis = redisService.getClient();
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.refreshLeaderboardAndBroadcast();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Failed to refresh and broadcast leaderboard on init: ${message}`,
      );
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleLeaderboardBroadcast(): Promise<void> {
    try {
      await this.refreshLeaderboardAndBroadcast();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Failed to refresh and broadcast leaderboard: ${message}`,
      );
    }
  }

  async getTopPlayers(limit = DEFAULT_MAX_ENTRIES): Promise<CachedLeaderboard> {
    const cached = await this.redis.get(LEADERBOARD_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as CachedLeaderboard;
      return {
        ...parsed,
        entries: parsed.entries.slice(0, limit),
      };
    }

    const entries = await this.queryLeaderboard();
    this.cacheLeaderboard(entries);
    return {
      updatedAt: new Date().toISOString(),
      entries: entries.slice(0, limit),
    };
  }

  async refreshLeaderboardAndBroadcast(): Promise<CachedLeaderboard> {
    const leaderboard = await this.refreshLeaderboard();
    const response = LeaderboardResponseDto.from({
      ...leaderboard,
      entries: leaderboard.entries.slice(0, DEFAULT_MAX_ENTRIES),
    });
    this.leaderboardSseService.broadcastTop1000(response);
    await this.leaderboardGateway.broadcastTop1000();
    return leaderboard;
  }

  async refreshLeaderboard(): Promise<CachedLeaderboard> {
    const entries = await this.queryLeaderboard();
    return this.cacheLeaderboard(entries);
  }

  private async cacheLeaderboard(
    entries: LeaderboardEntry[],
  ): Promise<CachedLeaderboard> {
    const payload: CachedLeaderboard = {
      updatedAt: new Date().toISOString(),
      entries,
    };
    await this.redis.set(
      LEADERBOARD_KEY,
      JSON.stringify(payload),
      'EX',
      CACHE_TTL_SECONDS,
    );
    return payload;
  }

  private async queryLeaderboard(
    maxEntries = DEFAULT_MAX_ENTRIES,
  ): Promise<LeaderboardEntry[]> {
    const bestScores = await this.prisma.score.findMany({
      distinct: ['userId'],
      orderBy: [{ value: 'desc' }, { createdAt: 'asc' }, { userId: 'asc' }],
      take: maxEntries,
    });

    return bestScores.map((record, index) => ({
      rank: index + 1,
      userId: record.userId,
      score: record.value,
      achievedAt: record.createdAt.toISOString(),
    }));
  }
}
