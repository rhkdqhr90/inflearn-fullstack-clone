import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Max, Min } from 'class-validator';

export class MentoringScheduleDto {
  @ApiProperty({
    description: '요일 (0: 일요일 ~ 6: 토요일)',
  })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({
    description: '시작 시간 (HH:mm 형식)',
  })
  @IsString()
  startTime: string;

  @ApiProperty({
    description: '종료 시간 (HH:mm 형식)',
  })
  @IsString()
  endTime: string;
}
