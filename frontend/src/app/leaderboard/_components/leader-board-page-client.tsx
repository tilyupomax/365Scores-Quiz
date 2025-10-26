"use client";

import type { LeaderboardEntry } from "@/api/leaderboard";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useLeaderboardSseSubscription } from "@/api/leaderboard";
import { routes } from "@/config";
import { useHydrated } from "@/hooks";
import { cn } from "@/lib";
import { useLeaderboardStore } from "@/stores/zustang";

import { LeaderboardTable } from "./leaderboard-table";

const TABLE_LIMIT = 1000;

export function LeaderBoardPageClient() {
  const hydrated = useHydrated();
  const searchParams = useSearchParams();
  const scoreParam = searchParams.get("score");
  const parsedScore = Number.parseInt(scoreParam ?? "", 10);
  const score = Number.isFinite(parsedScore) && parsedScore >= 0 ? parsedScore : null;

  const headingLabel = score !== null ? "Great job!" : "Live leaderboard";
  const buttonLabel = score !== null ? "Try Again" : "Start Quiz";

  useLeaderboardSseSubscription(TABLE_LIMIT);

  const snapshot = useLeaderboardStore((state) => state.snapshots[TABLE_LIMIT] ?? null);
  const entries: LeaderboardEntry[] = snapshot?.entries ?? [];

  const updatedAtLabel = (() => {
    if (!snapshot?.updatedAt) {
      return null;
    }

    const date = new Date(snapshot.updatedAt);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toLocaleString();
  })();

  if (!hydrated) {
    return null;
  }

  const isLoadingTable = snapshot === null;

  return (
    <div className="flex w-full max-w-4xl flex-col gap-10 rounded-3xl bg-white/90 p-10 shadow-xl backdrop-blur dark:bg-zinc-900/90">
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{headingLabel}</h2>
        {score !== null ? (
          <p className="text-lg text-zinc-600 dark:text-zinc-300">
            You locked in{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">{score}</span>
            {` point${score === 1 ? "" : "s"}`} this round. Check the live standings below.
          </p>
        ) : (
          <p className="text-lg text-zinc-600 dark:text-zinc-300">
            Track the live standings and see who is climbing the ranks in real time.
          </p>
        )}
        {updatedAtLabel ? (
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Last updated {updatedAtLabel}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-left text-xl font-semibold text-zinc-800 dark:text-zinc-100">
            Top {TABLE_LIMIT} Leaderboard
          </h3>
          <span className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Auto-refresh every 5 minutes
          </span>
        </div>

        <LeaderboardTable entries={entries} isLoading={isLoadingTable} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-zinc-500 dark:text-zinc-300">
          Want another shot at the top? Start again from the home screen.
        </div>

        <Link
          href={routes.home.value}
          className={cn(
            "rounded-full px-6 py-3 text-sm font-semibold transition",
            "bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
          )}
        >
          {buttonLabel}
        </Link>
      </div>
    </div>
  );
}
