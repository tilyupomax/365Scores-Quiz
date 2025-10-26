import type { LeaderboardResponseDto } from '@/leaderboard/dtos';
import { Injectable, Logger } from '@nestjs/common';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable()
export class LeaderboardSseService {
  private readonly logger = new Logger(LeaderboardSseService.name);
  private readonly top1000Stream$ = new ReplaySubject<LeaderboardResponseDto>(
    1,
  );

  streamTop1000(): Observable<LeaderboardResponseDto> {
    return this.top1000Stream$.asObservable();
  }

  broadcastTop1000(payload: LeaderboardResponseDto): void {
    this.logger.verbose('Broadcasting leaderboard update over SSE');
    this.top1000Stream$.next(payload);
  }
}
