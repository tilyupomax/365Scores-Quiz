"use client";

import type { QuizSessionSnapshot } from "../types";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { quizApi } from "../quiz.api";
import { quizQueryKeys } from "../quiz.keys";

export async function startQuizSession(): Promise<QuizSessionSnapshot> {
  return quizApi.startQuizSession();
}

export function useStartQuizSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startQuizSession,
    onSuccess: (snapshot) => {
      queryClient.setQueryData(quizQueryKeys.session(snapshot.sessionId), snapshot);
    },
  });
}
