import { PrismaService } from '@/common/prisma/services';
import { LeaderboardService } from '@/leaderboard/services';
import { AnswerQuestionDto } from '@/quiz/dtos';
import {
  AnswerResponse,
  QuestionOption,
  QuestionPayload,
  QuizStateResponse,
  StartQuizResponse,
} from '@/quiz/types';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { QuizSession } from '@prisma/client';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly leaderboardService: LeaderboardService,
  ) {}

  async startQuiz(userId: string): Promise<StartQuizResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const session = await this.prisma.quizSession.create({
      data: {
        userId: user.id,
      },
    });

    const [questionsAmount, nextQuestion] = await Promise.all([
      this.prisma.question.count(),
      this.pullNextQuestion(session.id),
    ]);

    if (questionsAmount === 0) {
      throw new InternalServerErrorException('No questions available');
    }

    if (!nextQuestion) {
      throw new InternalServerErrorException('No questions available');
    }

    return {
      sessionId: session.id,
      nextQuestion,
      questionsAmount,
    };
  }

  async answerQuestion(
    dto: AnswerQuestionDto,
    userId: string,
  ): Promise<AnswerResponse> {
    const session = await this.resolveAnswerSession(dto, userId);

    const answerOption = await this.prisma.answerOption.findUnique({
      where: { id: dto.answerOptionId },
      include: { question: true },
    });

    if (!answerOption || answerOption.questionId !== dto.questionId) {
      throw new BadRequestException('Answer option does not match question');
    }

    const correct = answerOption.isCorrect;

    let correctOptionId: number | null = null;
    if (correct) {
      correctOptionId = answerOption.id;
    } else {
      const correctOption = await this.prisma.answerOption.findFirst({
        where: {
          questionId: dto.questionId,
          isCorrect: true,
        },
        select: { id: true },
      });

      if (correctOption) {
        correctOptionId = correctOption.id;
      }
    }

    if (!correctOptionId) {
      this.logger.error(
        `Correct answer missing for question ${dto.questionId} in session ${dto.sessionId}`,
      );
      throw new InternalServerErrorException('Correct answer not configured');
    }

    await this.prisma.response.create({
      data: {
        sessionId: dto.sessionId,
        questionId: dto.questionId,
        selectedOptionId: dto.answerOptionId,
        correct,
      },
    });

    let updatedSession = session;
    if (correct) {
      updatedSession = await this.prisma.quizSession.update({
        where: { id: session.id },
        data: { score: { increment: 1 } },
      });
    }

    const nextQuestion = await this.pullNextQuestion(dto.sessionId);

    if (!nextQuestion) {
      await this.completeSession(updatedSession.id);
      const refreshed = await this.prisma.quizSession.findUnique({
        where: { id: updatedSession.id },
      });
      if (!refreshed) {
        throw new InternalServerErrorException('Failed to reload session');
      }
      return {
        correct,
        correctOptionId,
        score: refreshed.score,
        isFinished: true,
        nextQuestion: null,
      };
    }

    const current = await this.prisma.quizSession.findUnique({
      where: { id: updatedSession.id },
    });
    if (!current) {
      throw new InternalServerErrorException('Failed to reload session');
    }

    return {
      correct,
      correctOptionId,
      score: current.score,
      isFinished: false,
      nextQuestion,
    };
  }

  async getCurrentState(
    sessionId: string,
    userId: string,
  ): Promise<QuizStateResponse> {
    const session = await this.prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        currentQuestion: {
          include: {
            answerOptions: {
              select: {
                id: true,
                text: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.userId !== userId) {
      throw new BadRequestException('Session does not belong to user');
    }

    const questionsAmount = await this.prisma.question.count();

    const currentQuestion: QuestionPayload | null = session.currentQuestion
      ? {
          id: session.currentQuestion.id,
          text: session.currentQuestion.text,
          order: session.currentQuestion.order,
          options: session.currentQuestion.answerOptions.map<QuestionOption>(
            (option) => ({
              id: option.id,
              text: option.text,
            }),
          ),
        }
      : null;

    return {
      sessionId: session.id,
      score: session.score,
      isFinished: session.isFinished,
      currentQuestion,
      questionsAmount,
    };
  }

  private async resolveAnswerSession(
    dto: AnswerQuestionDto,
    userId: string,
  ): Promise<QuizSession> {
    const session = await this.prisma.quizSession.findUnique({
      where: { id: dto.sessionId },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.userId !== userId) {
      throw new BadRequestException('Session does not belong to user');
    }

    if (session.isFinished) {
      throw new BadRequestException('Session already completed');
    }

    if (!session.currentQuestionId) {
      throw new BadRequestException('No active question for session');
    }

    if (session.currentQuestionId !== dto.questionId) {
      throw new BadRequestException('Question mismatch for session');
    }

    return session;
  }

  private async pullNextQuestion(
    sessionId: string,
  ): Promise<QuestionPayload | null> {
    const session = await this.prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        currentQuestion: {
          select: {
            id: true,
            order: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const nextQuestion = await this.prisma.question.findFirst({
      where: session.currentQuestion
        ? {
            order: {
              gt: session.currentQuestion.order,
            },
          }
        : undefined,
      orderBy: { order: 'asc' },
      include: {
        answerOptions: {
          select: {
            id: true,
            text: true,
          },
        },
      },
    });

    if (!nextQuestion) {
      return null;
    }

    await this.prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        currentQuestionId: nextQuestion.id,
      },
    });

    return {
      id: nextQuestion.id,
      text: nextQuestion.text,
      order: nextQuestion.order,
      options: nextQuestion.answerOptions as QuestionOption[],
    };
  }

  private async completeSession(sessionId: string): Promise<void> {
    const session = await this.prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        isFinished: true,
        completedAt: new Date(),
        currentQuestionId: null,
      },
      include: {
        user: true,
      },
    });

    await this.prisma.score.create({
      data: {
        userId: session.userId,
        value: session.score,
      },
    });

    await this.leaderboardService.refreshLeaderboardAndBroadcast();
  }
}
