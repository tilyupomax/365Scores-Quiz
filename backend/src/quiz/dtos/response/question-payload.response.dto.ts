import type { QuestionPayload } from '@/quiz/types';
import { Exclude, Expose, Type, plainToInstance } from 'class-transformer';

import { QuestionOptionResponseDto } from '@/quiz/dtos/response/question-option.response.dto';

@Exclude()
export class QuestionPayloadResponseDto implements QuestionPayload {
  @Expose()
  readonly id!: number;

  @Expose()
  readonly text!: string;

  @Expose()
  readonly order!: number;

  @Expose()
  @Type(() => QuestionOptionResponseDto)
  readonly options!: QuestionOptionResponseDto[];

  static from(payload: QuestionPayload): QuestionPayloadResponseDto {
    return plainToInstance(QuestionPayloadResponseDto, payload, {
      excludeExtraneousValues: true,
    });
  }
}
