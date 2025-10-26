import type { QuizSessionSnapshot, QuizStateResponseDto } from "../types";

export function toQuizSessionSnapshot(dto: QuizStateResponseDto): QuizSessionSnapshot {
  return {
    sessionId: dto.sessionId,
    score: dto.score,
    isFinished: dto.isFinished,
    currentQuestion: dto.currentQuestion,
    questionsAmount: dto.questionsAmount,
    lastAnswer: null,
  };
}
