export interface QuestionOption {
  id: number;
  text: string;
}

export interface QuestionPayload {
  id: number;
  text: string;
  order: number;
  options: QuestionOption[];
}

export interface StartQuizResponse {
  sessionId: string;
  nextQuestion: QuestionPayload;
  questionsAmount: number;
}

export interface AnswerResponse {
  correct: boolean;
  score: number;
  isFinished: boolean;
  correctOptionId: number;
  nextQuestion: QuestionPayload | null;
}

export interface QuizStateResponse {
  sessionId: string;
  score: number;
  isFinished: boolean;
  currentQuestion: QuestionPayload | null;
  questionsAmount: number;
}
