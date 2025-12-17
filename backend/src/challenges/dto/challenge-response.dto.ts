import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChallengeResponseDto {
  @ApiProperty({ description: '챌린지 ID' })
  id: string;

  @ApiProperty({ description: '코스  ID' })
  courseId: string;

  @ApiProperty({ description: '최대 모집 인원', example: 100 })
  maxParticipants: number;

  @ApiProperty({ description: '현재 참가자 수', example: 45 })
  currentParticipants: number;

  @ApiProperty({ description: '모집 시작일' })
  recruitStartAt: Date;

  @ApiProperty({ description: '모집 마감일' })
  recruitEndAt: Date;

  @ApiProperty({
    description: '챌린지 시작일',
  })
  challengeStartAt: Date;

  @ApiProperty({
    description: '챌린지 종료일',
  })
  challengeEndAt: Date;

  @ApiProperty({
    description: '챌린지 상태',
    enum: ['RECRUITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    example: 'RECRUITING',
  })
  status: string;

  @ApiProperty({ description: '생성일' })
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: '강의 정보' })
  course?: any;

  @ApiPropertyOptional({ description: '참가자 목록' })
  participants?: any[];
}
