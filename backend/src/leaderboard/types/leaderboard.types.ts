export interface LeaderboardEntry {
  rank: number;
  userId: string;
  score: number;
  achievedAt: string;
}

export interface CachedLeaderboard {
  updatedAt: string;
  entries: LeaderboardEntry[];
}
