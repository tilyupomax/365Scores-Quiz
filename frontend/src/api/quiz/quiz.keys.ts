export const quizQueryKeys = {
  start: () => ["quiz", "start"] as const,
  session: (sessionId: string) => ["quiz", "session", sessionId] as const,
};
