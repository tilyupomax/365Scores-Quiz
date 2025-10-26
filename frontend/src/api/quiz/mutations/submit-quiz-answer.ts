"use client";

import type { QuizSessionSnapshot, SubmitAnswerPayload, SubmitAnswerResponse } from "../types";

import { useEffect, useRef } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { quizApi } from "../quiz.api";
import { quizQueryKeys } from "../quiz.keys";

export async function submitQuizAnswer(
  payload: SubmitAnswerPayload,
): Promise<SubmitAnswerResponse> {
  return quizApi.submitQuizAnswer(payload);
}

export function useSubmitQuizAnswer(sessionId: string | null, feedbackTimeoutMs: number) {
  const queryClient = useQueryClient();
  const feedbackTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        window.clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  return useMutation({
    mutationFn: submitQuizAnswer,
    onSuccess: (result, variables) => {
      if (!sessionId) {
        return;
      }
      feedbackTimeoutRef.current = window.setTimeout(() => {
        queryClient.setQueryData(quizQueryKeys.session(sessionId), (previousSnapshot) => {
          const previous = previousSnapshot as QuizSessionSnapshot | undefined;

          const nextSnapshot: QuizSessionSnapshot = {
            sessionId,
            score: result.score,
            isFinished: result.isFinished,
            currentQuestion: result.nextQuestion,
            questionsAmount: previous?.questionsAmount ?? 0,
            lastAnswer: {
              questionId: variables.questionId,
              answerOptionId: variables.answerOptionId,
              correct: result.correct,
            },
          };

          return nextSnapshot;
        });
      }, feedbackTimeoutMs);
    },
  });
}
