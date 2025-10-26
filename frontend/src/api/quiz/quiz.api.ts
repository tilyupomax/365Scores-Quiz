import type {
  QuizSessionSnapshot,
  QuizStateResponseDto,
  StartQuizResponse,
  SubmitAnswerPayload,
  SubmitAnswerResponse,
} from "./types";

import { httpClient } from "@/services/http";

import { toQuizSessionSnapshot } from "./transformers";

function createSnapshot(payload: StartQuizResponse): QuizSessionSnapshot {
  return {
    sessionId: payload.sessionId,
    score: 0,
    isFinished: false,
    currentQuestion: payload.nextQuestion,
    questionsAmount: payload.questionsAmount,
    lastAnswer: null,
  };
}

export class QuizApi {
  async startQuizSession(): Promise<QuizSessionSnapshot> {
    const response = await httpClient
      .post<StartQuizResponse>("/quiz/start", {})
      .then((res) => res.data);

    return createSnapshot(response);
  }

  async getQuizSession(sessionId: string): Promise<QuizSessionSnapshot> {
    const response = await httpClient
      .get<QuizStateResponseDto>(`/quiz/${sessionId}`)
      .then((res) => res.data);

    return toQuizSessionSnapshot(response);
  }

  async submitQuizAnswer(payload: SubmitAnswerPayload): Promise<SubmitAnswerResponse> {
    return httpClient.patch<SubmitAnswerResponse>("/quiz/answer", payload).then((res) => res.data);
  }
}

export const quizApi = new QuizApi();
