import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class JoinChallengeDto {
  @ApiProperty({
    description: '챌린지 ID',
  })
  @IsString()
  challengeId: string;
}
