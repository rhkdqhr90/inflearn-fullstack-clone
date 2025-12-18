import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum MentoringApplicationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export class UpdateApplicationStatusDto {
  @ApiProperty({
    description: '신청 상태',
    enum: MentoringApplicationStatus,
  })
  @IsEnum(MentoringApplicationStatus)
  status: MentoringApplicationStatus;
}
