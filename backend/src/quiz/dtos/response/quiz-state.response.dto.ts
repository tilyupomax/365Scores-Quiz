import type { QuizStateResponse } from '@/quiz/types';
import { Exclude, Expose, Type, plainToInstance } from 'class-transformer';

import { QuestionPayloadResponseDto } from '@/quiz/dtos/response/question-payload.response.dto';

@Exclude()
export class QuizStateResponseDto implements QuizStateResponse {
  @Expose()
  readonly sessionId: string;

  @Expose()
  readonly score!: number;

  @Expose()
  readonly isFinished!: QuizStateResponse['isFinished'];

  @Expose()
  @Type(() => QuestionPayloadResponseDto)
  readonly currentQuestion!: QuestionPayloadResponseDto | null;

  @Expose()
  readonly questionsAmount!: number;

  static from(response: QuizStateResponse): QuizStateResponseDto {
    return plainToInstance(QuizStateResponseDto, response, {
      excludeExtraneousValues: true,
    });
  }
}
