export type QuizAnswerOption = {
  id: number;
  text: string;
};

export type QuizQuestion = {
  id: number;
  text: string;
  options: QuizAnswerOption[];
  order: number;
};

export type StartQuizResponse = {
  sessionId: string;
  nextQuestion: QuizQuestion;
  questionsAmount: number;
};

export type SubmitAnswerPayload = {
  sessionId: string;
  questionId: number;
  answerOptionId: number;
};

export type SubmitAnswerResponse = {
  correct: boolean;
  score: number;
  isFinished: boolean;
  correctOptionId: number;
  nextQuestion: QuizQuestion | null;
};

export type QuizSessionSnapshot = {
  sessionId: string;
  score: number;
  isFinished: boolean;
  currentQuestion: QuizQuestion | null;
  questionsAmount: number;
  lastAnswer: {
    questionId: number;
    answerOptionId: number;
    correct: boolean;
  } | null;
};

export interface QuizStateResponseDto {
  sessionId: string;
  score: number;
  isFinished: boolean;
  currentQuestion: QuizQuestion | null;
  questionsAmount: number;
}
