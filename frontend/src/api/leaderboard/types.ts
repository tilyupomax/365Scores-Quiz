export type LeaderboardEntry = {
  rank: string;
  userId: string;
  score: string;
  achievedAt: string;
};

export type LeaderboardSnapshot = {
  updatedAt: string;
  entries: LeaderboardEntry[];
};
