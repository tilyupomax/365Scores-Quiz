"use client";

import { useCallback } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useStartQuizSession, quizQueryKeys } from "@/api/quiz";
import { routes } from "@/config";
import { cn } from "@/lib";

export function HomePageClient() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: startQuizSession, isPending, isSuccess } = useStartQuizSession();

  const handleBeginQuiz = useCallback(() => {
    if (isPending) {
      return;
    }

    startQuizSession(undefined, {
      onSuccess: (snapshot) => {
        queryClient.setQueryData(quizQueryKeys.session(snapshot.sessionId), snapshot);
        router.push(routes.quiz.session(snapshot.sessionId));
      },
    });
  }, [isPending, queryClient, router, startQuizSession]);

  return (
    <div className="flex  flex-col items-center justify-center gap-10 rounded-3xl bg-white/80 p-10 shadow-lg backdrop-blur dark:bg-zinc-900/80">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="rounded-full bg-zinc-100 px-4 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
          365Scores Quiz
        </span>
        <h1 className="text-balance text-4xl font-bold text-zinc-900 dark:text-zinc-50">
          Ready to test your sports knowledge?
        </h1>
        <p className="max-w-xl text-balance text-lg text-zinc-600 dark:text-zinc-300">
          Answer rapid-fire questions without repeats, keep the streak alive, and climb the live
          leaderboard.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <button
          type="button"
          onClick={handleBeginQuiz}
          disabled={isPending}
          className={cn(
            "w-full rounded-full px-8 py-3 text-lg font-semibold transition sm:w-auto",
            "bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
            "disabled:cursor-not-allowed disabled:bg-zinc-400 disabled:text-zinc-200 disabled:opacity-70",
          )}
        >
          {isPending || isSuccess ? "Starting..." : "Start the Quiz"}
        </button>
      </div>
    </div>
  );
}
