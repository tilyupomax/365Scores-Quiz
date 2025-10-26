"use client";

import type { QuizSessionSnapshot } from "../types";

import { useMemo } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { quizApi } from "../quiz.api";
import { quizQueryKeys } from "../quiz.keys";

const IDLE_QUERY_KEY = ["quiz", "session", "idle"] as const;

export function useQuizSession(sessionId: string | null) {
  const queryClient = useQueryClient();

  const queryKey = useMemo(
    () => (sessionId ? quizQueryKeys.session(sessionId) : IDLE_QUERY_KEY),
    [sessionId],
  );

  return useQuery({
    queryKey,
    enabled: Boolean(sessionId),
    queryFn: async () => {
      if (!sessionId) {
        throw new Error("Missing active quiz session");
      }

      return quizApi.getQuizSession(sessionId);
    },
    initialData: () => {
      if (!sessionId) {
        return undefined;
      }

      return queryClient.getQueryData<QuizSessionSnapshot>(queryKey);
    },
    staleTime: Infinity,
  });
}
