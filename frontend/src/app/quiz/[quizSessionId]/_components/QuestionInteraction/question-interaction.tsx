"use client";

import type { QuizQuestion } from "@/api/quiz/types";

import { useEffect, useRef, useState } from "react";

import { useQuizSession, type useSubmitQuizAnswer } from "@/api/quiz";
import { cn } from "@/lib";

type FeedbackState = {
  headline: string;
  description?: string;
  isCorrect: boolean;
  correctOptionId?: number;
};

type SubmitAnswerFn = ReturnType<typeof useSubmitQuizAnswer>["mutate"];

export type QuestionInteractionProps = {
  sessionId: string;
  question: QuizQuestion;
  submitAnswer: SubmitAnswerFn;
  isSubmitting: boolean;
  onScoreChange: (score: number) => void;
  onComplete: (score: number) => void;
  feedbackTimeoutMs: number;
};

export function QuestionInteraction({
  sessionId,
  question,
  submitAnswer,
  isSubmitting,
  onScoreChange,
  onComplete,
  feedbackTimeoutMs,
}: QuestionInteractionProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);
  const { data: session } = useQuizSession(sessionId);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        window.clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const handleOptionSelect = (optionId: number) => {
    if (isSubmitting || selectedOptionId !== null) {
      return;
    }

    setSelectedOptionId(optionId);

    submitAnswer(
      {
        sessionId,
        questionId: question.id,
        answerOptionId: optionId,
      },
      {
        onSuccess: (result) => {
          onScoreChange(result.score);

          if (feedbackTimeoutRef.current) {
            window.clearTimeout(feedbackTimeoutRef.current);
          }

          setFeedback({
            headline: result.correct ? "Correct!" : "Incorrect",
            description: result.isFinished
              ? "Final score locked in. Redirecting to the leaderboard."
              : "Next question incoming...",
            isCorrect: result.correct,
            correctOptionId: result.correctOptionId,
          });

          feedbackTimeoutRef.current = window.setTimeout(() => {
            setFeedback(null);

            if (result.isFinished) {
              onComplete(result.score);
            }
          }, feedbackTimeoutMs);
        },
        onError: (mutationError) => {
          setFeedback({
            headline: "Something went wrong",
            description: mutationError instanceof Error ? mutationError.message : undefined,
            isCorrect: false,
          });
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{question.text}</h2>

      <div className="grid gap-4">
        {question.options.map((option) => {
          const isChosen = selectedOptionId === option.id;
          const isCorrectOption = feedback?.correctOptionId === option.id;
          const isIncorrectSelection = Boolean(feedback && !feedback.isCorrect && isChosen);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleOptionSelect(option.id)}
              disabled={isSubmitting || selectedOptionId !== null}
              className={cn(
                "w-full rounded-2xl border px-6 py-4 text-left text-lg font-medium transition",
                "border-zinc-200 bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
                "dark:border-zinc-700 dark:bg-zinc-800",
                {
                  "opacity-80": isSubmitting || selectedOptionId !== null,
                  "hover:border-blue-500 hover:bg-blue-50 dark:hover:border-blue-400 dark:hover:bg-blue-900/40":
                    !isSubmitting && selectedOptionId === null,
                  "border-blue-500 bg-blue-50 text-blue-900 dark:border-blue-400 dark:bg-blue-900/40 dark:text-blue-200":
                    isChosen && !feedback,
                  "border-green-500 bg-green-50 text-green-900 dark:border-green-400 dark:bg-green-900/40 dark:text-green-200":
                    !!feedback && isCorrectOption,
                  "border-red-500 bg-red-50 text-red-900 dark:border-red-400 dark:bg-red-900/40 dark:text-red-200":
                    !!feedback && isChosen && isIncorrectSelection,
                },
              )}
            >
              <span className="block text-base font-semibold text-zinc-500 dark:text-zinc-300">
                {option.text}
              </span>
            </button>
          );
        })}
      </div>

      {feedback ? (
        <div
          className={cn(
            "flex items-center justify-between rounded-2xl border px-6 py-4 text-sm font-semibold shadow-sm",
            feedback.isCorrect
              ? "border-green-300 bg-green-50 text-green-700 dark:border-green-500/60 dark:bg-green-900/40 dark:text-green-200"
              : "border-red-300 bg-red-50 text-red-700 dark:border-red-500/60 dark:bg-red-900/40 dark:text-red-200",
          )}
        >
          <div className="flex flex-col gap-1">
            <span>{feedback.headline}</span>
            {feedback.description ? (
              <span className="text-xs text-zinc-500 dark:text-zinc-300">
                {feedback.description}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
