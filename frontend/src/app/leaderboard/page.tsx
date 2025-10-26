import { Suspense } from "react";

import { LeaderBoardPageClient } from "./_components/leader-board-page-client";

function LeaderboardFallback() {
  return (
    <div className="flex w-full max-w-4xl flex-col gap-10 rounded-3xl bg-white/90 p-10 shadow-xl backdrop-blur dark:bg-zinc-900/90">
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Loading...</h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-300">Loading leaderboard data...</p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-left text-xl font-semibold text-zinc-800 dark:text-zinc-100">
            Top 1000 Leaderboard
          </h3>
        </div>
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-12 rounded bg-zinc-200 dark:bg-zinc-700" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LeaderBoardPage() {
  return (
    <Suspense fallback={<LeaderboardFallback />}>
      <LeaderBoardPageClient />
    </Suspense>
  );
}
