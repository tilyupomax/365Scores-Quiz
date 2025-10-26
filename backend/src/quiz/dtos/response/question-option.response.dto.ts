import type { QuestionOption } from '@/quiz/types';
import { Exclude, Expose, plainToInstance } from 'class-transformer';

@Exclude()
export class QuestionOptionResponseDto implements QuestionOption {
  @Expose()
  readonly id!: number;

  @Expose()
  readonly text!: string;

  static from(option: QuestionOption): QuestionOptionResponseDto {
    return plainToInstance(QuestionOptionResponseDto, option, {
      excludeExtraneousValues: true,
    });
  }
}
