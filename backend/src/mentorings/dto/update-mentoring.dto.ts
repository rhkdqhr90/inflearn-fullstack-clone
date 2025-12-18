import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateMentoringDto } from './create-mentoring.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateMentoringDto extends PartialType(CreateMentoringDto) {
  @ApiPropertyOptional({
    description: '멘토링 활성화 여부',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
