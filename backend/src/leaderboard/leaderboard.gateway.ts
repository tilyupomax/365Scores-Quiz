import { LeaderboardService } from '@/leaderboard/services';
import { Inject, Logger, forwardRef } from '@nestjs/common';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'leaderboard',
  cors: {
    origin: '*',
  },
})
export class LeaderboardGateway implements OnGatewayConnection {
  private readonly logger = new Logger(LeaderboardGateway.name);
  @WebSocketServer()
  private server!: Server;

  constructor(
    @Inject(forwardRef(() => LeaderboardService))
    private readonly leaderboardService: LeaderboardService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const leaderboard = await this.leaderboardService.getTopPlayers(1000);
    client.emit('leaderboard/top1000', leaderboard);
    this.logger.verbose(`Client connected: ${client.id}`);
  }

  async broadcastTop1000(): Promise<void> {
    if (!this.server) {
      this.logger.warn('Attempted to broadcast before gateway initialization');
      return;
    }

    const leaderboard = await this.leaderboardService.getTopPlayers(1000);
    this.server.emit('leaderboard/top1000', leaderboard);
  }
}
