export const leaderboardRealtimeConfig = {
  namespace: "/leaderboard",
  path: "/socket.io",
  event: "leaderboard/top1000",
} as const;

export const leaderboardRealtimeSSEConfig = {
  event: "leaderboard.top1000",
  sseEndpoint: "/leaderboard/stream/top1000",
} as const;
