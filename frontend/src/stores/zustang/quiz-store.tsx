"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";

import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

type QuizState = {
  sessionId: string | null;
  isFinished: boolean;
  score: number;
};

type QuizActions = {
  startSession: (sessionId: string) => void;
  updateScore: (score: number) => void;
  completeSession: (finalScore: number) => void;
  resetQuiz: () => void;
};

export type QuizStore = QuizState & QuizActions;

type QuizStoreSelector<T> = (state: QuizStore) => T;

function createInitialState(sessionId: string | null = null): QuizState {
  return {
    sessionId,
    isFinished: false,
    score: 0,
  };
}
export function createQuizStore(initialState: QuizState = createInitialState()) {
  return createStore<QuizStore>()((set) => ({
    ...initialState,
    startSession: (sessionId) =>
      set(() => ({
        sessionId,
        isFinished: false,
        score: 0,
      })),
    updateScore: (score) =>
      set(() => ({
        score,
      })),
    completeSession: (finalScore) =>
      set(() => ({
        score: finalScore,
        isFinished: true,
      })),
    resetQuiz: () => set(() => createInitialState()),
  }));
}

export type QuizStoreApi = ReturnType<typeof createQuizStore>;

const QuizStoreContext = createContext<QuizStoreApi | null>(null);

type QuizStoreProviderProps = {
  children: ReactNode;
  initialSessionId?: string | null;
};

export function QuizStoreProvider({ children, initialSessionId = null }: QuizStoreProviderProps) {
  const storeRef = useRef<QuizStoreApi | null>(null);

  storeRef.current ??= createQuizStore(createInitialState(initialSessionId ?? null));

  const store = storeRef.current;

  if (!store) {
    throw new Error("Quiz store failed to initialize");
  }

  useEffect(() => {
    const { resetQuiz, startSession, sessionId } = store.getState();

    if (!initialSessionId) {
      resetQuiz();
      return;
    }

    if (sessionId !== initialSessionId) {
      startSession(initialSessionId);
    }
  }, [initialSessionId, store]);

  return <QuizStoreContext.Provider value={store}>{children}</QuizStoreContext.Provider>;
}

export function useQuizStore(): QuizStore;
export function useQuizStore<T>(selector: QuizStoreSelector<T>): T;
export function useQuizStore<T>(selector?: QuizStoreSelector<T>) {
  const store = useContext(QuizStoreContext);
  if (!store) {
    throw new Error("Missing QuizStoreProvider");
  }

  const selectorFn = selector ?? ((state) => state as unknown as T);

  return useStore(store, selectorFn);
}
