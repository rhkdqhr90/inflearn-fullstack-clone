import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateLectureActivityDto {
  @ApiProperty({ description: '개별 강의 제목' })
  @IsNotEmpty()
  @IsNumber()
  progress: number;

  @ApiProperty({ description: '강의 재생 시간' })
  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @ApiProperty({ description: '강의 왼료 여부' })
  @IsNotEmpty()
  @IsBoolean()
  isCompleted: boolean;

  @ApiProperty({ description: '마지막 시청 시간' })
  @IsNotEmpty()
  @IsDate()
  lastWatchedAt: Date;
}
