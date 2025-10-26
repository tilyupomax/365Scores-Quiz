export const routes = {
  home: { value: "/" },
  quiz: {
    value: "/quiz",
    session: (sessionId: string) => `/quiz/${sessionId}`,
  },
  leaderboard: {
    value: "/leaderboard",
    withScore: (score: number) => `/leaderboard?score=${encodeURIComponent(String(score))}`,
  },
} as const;
