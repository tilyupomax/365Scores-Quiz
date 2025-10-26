import { Type } from 'class-transformer';
import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class AnswerQuestionDto {
  @IsUUID()
  sessionId!: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  questionId!: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  answerOptionId!: number;
}
