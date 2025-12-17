import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateChallengeDto } from './create-challnege.dto';

export class UpdateChallengeDto extends PartialType(CreateChallengeDto) {
  @ApiPropertyOptional({
    description: '챌린지 상태',
    enum: ['RECRUITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  })
  @IsString()
  @IsOptional()
  status?: string;
}
