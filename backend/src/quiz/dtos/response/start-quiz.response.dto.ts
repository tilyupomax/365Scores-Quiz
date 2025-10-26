import type { StartQuizResponse } from '@/quiz/types';
import { Exclude, Expose, Type, plainToInstance } from 'class-transformer';

import { QuestionPayloadResponseDto } from '@/quiz/dtos/response/question-payload.response.dto';

@Exclude()
export class StartQuizResponseDto implements StartQuizResponse {
  @Expose()
  readonly sessionId!: string;

  @Expose()
  @Type(() => QuestionPayloadResponseDto)
  readonly nextQuestion!: QuestionPayloadResponseDto;

  @Expose()
  readonly questionsAmount!: number;

  static from(response: StartQuizResponse): StartQuizResponseDto {
    return plainToInstance(StartQuizResponseDto, response, {
      excludeExtraneousValues: true,
    });
  }
}
