"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { useQuizSession, useSubmitQuizAnswer } from "@/api/quiz";
import { routes } from "@/config";
import { useQuizStore } from "@/stores/zustang/quiz-store";

import { QuestionInteraction } from "./QuestionInteraction";
const FEEDBACK_TIMEOUT_MS = 1600;

export function QuestionPageClient() {
  const router = useRouter();
  const isFinished = useQuizStore((state) => state.isFinished);
  const sessionId = useQuizStore((state) => state.sessionId);
  const finalScore = useQuizStore((state) => state.score);
  const updateScore = useQuizStore((state) => state.updateScore);
  const completeSession = useQuizStore((state) => state.completeSession);

  const { data: session, isPending, isError, error } = useQuizSession(sessionId);
  const submitAnswerMutation = useSubmitQuizAnswer(sessionId, FEEDBACK_TIMEOUT_MS);

  useEffect(() => {
    if (!sessionId) {
      router.replace(routes.home.value);
    }
  }, [router, sessionId]);

  useEffect(() => {
    if (isFinished) {
      const href =
        Number.isFinite(finalScore) && finalScore >= 0
          ? routes.leaderboard.withScore(finalScore)
          : routes.leaderboard.value;
      router.replace(href);
    }
  }, [finalScore, isFinished, router]);

  if (!sessionId || isFinished) {
    return null;
  }

  if (isPending) {
    return (
      <div className="flex h-full flex-1 items-center justify-center text-lg text-zinc-600 dark:text-zinc-200">
        Loading your quiz session...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full flex-1 items-center justify-center text-center text-lg text-red-600 dark:text-red-300">
        {error instanceof Error ? error.message : "Unable to load quiz session."}
      </div>
    );
  }

  const currentQuestion = session?.currentQuestion ?? null;

  if (!currentQuestion) {
    return (
      <div className="flex h-full flex-1 items-center justify-center text-lg text-zinc-600 dark:text-zinc-200">
        Waiting for the next question...
      </div>
    );
  }

  const sessionScore = session?.score ?? 0;

  const percentComplete = (() => {
    const totalQuestions = session.questionsAmount;
    const currentQuestionIndex = session.currentQuestion?.order;

    if (!currentQuestionIndex) {
      return 1;
    }

    return ((currentQuestionIndex - 1) / totalQuestions) * 100;
  })();

  return (
    <div className="flex w-full max-w-3xl flex-col gap-12 rounded-3xl bg-white/90 p-10 shadow-xl backdrop-blur dark:bg-zinc-900/90">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm font-semibold text-zinc-500 dark:text-zinc-300">
          <span>Current score: {sessionScore}</span>
          <span>Session ID: {sessionId}</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>

      <QuestionInteraction
        key={currentQuestion.id}
        sessionId={sessionId}
        question={currentQuestion}
        submitAnswer={submitAnswerMutation.mutate}
        isSubmitting={submitAnswerMutation.isPending}
        onScoreChange={updateScore}
        onComplete={completeSession}
        feedbackTimeoutMs={FEEDBACK_TIMEOUT_MS}
      />
    </div>
  );
}
