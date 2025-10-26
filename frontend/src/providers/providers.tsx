"use client";

import type { ReactNode } from "react";

import { useParams } from "next/navigation";

import { TanstackQueryProvider } from "./tanstack-query-provider";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const params = useParams<{ quizSessionId?: string }>();
  const quizSessionId = params?.quizSessionId ?? null;

  return <TanstackQueryProvider>{children}</TanstackQueryProvider>;
}
