import { SessionGuard } from '@/auth/services';
import type { AuthenticatedRequest } from '@/auth/types';
import {
  AnswerQuestionDto,
  AnswerQuestionResponseDto,
  GetQuizStateParamsDto,
  QuizStateResponseDto,
  StartQuizDto,
  StartQuizResponseDto,
} from '@/quiz/dtos';
import { QuizService } from '@/quiz/services';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

@UseGuards(SessionGuard)
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('start')
  startQuiz(
    @Body() _dto: StartQuizDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<StartQuizResponseDto> {
    return this.quizService
      .startQuiz(req.sessionUser.id)
      .then(StartQuizResponseDto.from);
  }

  @Get(':sessionId')
  getQuizState(
    @Param() params: GetQuizStateParamsDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<QuizStateResponseDto> {
    return this.quizService
      .getCurrentState(params.sessionId, req.sessionUser.id)
      .then(QuizStateResponseDto.from);
  }

  @Patch('answer')
  answerQuestion(
    @Body() dto: AnswerQuestionDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<AnswerQuestionResponseDto> {
    return this.quizService
      .answerQuestion(dto, req.sessionUser.id)
      .then(AnswerQuestionResponseDto.from);
  }
}
