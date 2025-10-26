import type { AnswerResponse } from '@/quiz/types';
import { Exclude, Expose, Type, plainToInstance } from 'class-transformer';

import { QuestionPayloadResponseDto } from '@/quiz/dtos/response/question-payload.response.dto';

@Exclude()
export class AnswerQuestionResponseDto implements AnswerResponse {
  @Expose()
  readonly correct!: boolean;

  @Expose()
  readonly score!: number;

  @Expose()
  readonly isFinished!: boolean;

  @Expose()
  readonly correctOptionId!: number;

  @Expose()
  @Type(() => QuestionPayloadResponseDto)
  readonly nextQuestion!: QuestionPayloadResponseDto | null;

  static from(response: AnswerResponse): AnswerQuestionResponseDto {
    return plainToInstance(AnswerQuestionResponseDto, response, {
      excludeExtraneousValues: true,
    });
  }
}
