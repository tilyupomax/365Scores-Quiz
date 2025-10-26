import { QuizStoreProvider } from "@/stores/zustang";

import { QuestionPageClient } from "./_components/question-page-client";

type QuizPageProps = {
  params: Promise<{
    quizSessionId: string;
  }>;
};

export default async function QuizPage({ params }: QuizPageProps) {
  const { quizSessionId } = await params;
  const sessionKey = quizSessionId;

  return (
    <QuizStoreProvider initialSessionId={quizSessionId}>
      <QuestionPageClient key={sessionKey} />
    </QuizStoreProvider>
  );
}
