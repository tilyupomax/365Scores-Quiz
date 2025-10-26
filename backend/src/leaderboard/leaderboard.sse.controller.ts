import { LeaderboardResponseDto } from '@/leaderboard/dtos';
import { LeaderboardService } from '@/leaderboard/services';
import { LeaderboardSseService } from '@/leaderboard/services/leaderboard-sse.service';
import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { Observable, concat, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Controller('leaderboard')
export class LeaderboardSseController {
  constructor(
    private readonly leaderboardService: LeaderboardService,
    private readonly leaderboardSseService: LeaderboardSseService,
  ) {}

  // Streams the same leaderboard updates as the websocket gateway but over SSE
  @Sse('stream/top1000')
  streamTop1000(): Observable<MessageEvent> {
    const initial$ = from(
      this.leaderboardService.getTopPlayers(1000).then((leaderboard) => ({
        data: LeaderboardResponseDto.from(leaderboard),
        type: 'leaderboard.top1000',
      })),
    );

    const updates$ = this.leaderboardSseService.streamTop1000().pipe(
      map(
        (data): MessageEvent => ({
          data,
          type: 'leaderboard.top1000',
        }),
      ),
    );

    return concat(initial$, updates$);
  }
}
