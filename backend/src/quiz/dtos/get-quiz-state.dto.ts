import { IsUUID } from 'class-validator';

export class GetQuizStateParamsDto {
  @IsUUID()
  sessionId!: string;
}
