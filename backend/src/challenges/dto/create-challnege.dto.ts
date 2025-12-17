import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, Max, Min } from 'class-validator';

export class CreateChallengeDto {
  @ApiProperty({
    description: '최대 모집 입원',
    example: 100,
    minimum: 1,
    maximum: 1000,
  })
  @IsInt()
  @Min(1)
  @Max(1000)
  maxParticipants: number;

  @ApiProperty({ description: '모집 시작일' })
  @IsDateString()
  recruitStartAt: string;

  @ApiProperty({ description: '모집 종료일' })
  @IsDateString()
  recruitEndAt: string;

  @ApiProperty({ description: '챌린지 시작일' })
  @IsDateString()
  challengeStartAt: string;

  @ApiProperty({ description: '챌린지 종료일' })
  @IsDateString()
  challengeEndAt: string;
}
